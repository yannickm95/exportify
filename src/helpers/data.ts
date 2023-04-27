import { saveAs } from 'file-saver';
import chunk from 'lodash/chunk';

import { apiCall } from './api';
import { convertTracksToCsv, fileName, formatCompareValue, isArraySorted } from './utils';

export function getUser() {
  const user = apiCall('https://api.spotify.com/v1/me', { method: 'GET' });

  return user;
}

const PLAYLIST_LIMIT = 20;

export async function getPlaylists(userId: string) {
  const loadSlice = async (start: number, end: number) => {
    const playlistsUrl = `https://api.spotify.com/v1/users/${userId}/playlists?offset=${start}&limit=${end - start}`;
    const playlistsResponse = await apiCall(playlistsUrl, { method: 'GET' });

    return playlistsResponse;
  };

  const { items, total } = await loadSlice(0, PLAYLIST_LIMIT);

  let playlists = items;

  for (let offset = PLAYLIST_LIMIT; offset < total; offset = offset + PLAYLIST_LIMIT) {
    const { items } = await loadSlice(offset, offset + PLAYLIST_LIMIT);
    playlists = [...playlists, ...items];
  }

  return [
    ...playlists.filter((p) => p.name.toLowerCase() !== "release radar"),
    ...playlists.filter((p) => p.name.toLowerCase() === "release radar"),
  ];
}

export async function getPlaylistTracks(playlist: any) {
  const requests: string[] = [];
  const limit = playlist.tracks.limit || 100;

  for (let offset = 0; offset < playlist.tracks.total; offset = offset + limit) {
    requests.push(`${playlist.tracks.href.split('?')[0]}?offset=${offset}&limit=${limit}`);
  }

  const trackResponses = await Promise.all(requests.map((request) => apiCall(request, { method: 'GET' })));

  // Exclude null track attributes
  return trackResponses.flatMap((response) => response.items.filter((i: any) => i.track));
}

export function exportToCsv(tracks: any[], playlistName: string) {
  const blob = new Blob([convertTracksToCsv(tracks)], { type: 'text/csv;charset=utf-8' });

  saveAs(blob, fileName(playlistName));
}

export async function quickSortPlaylist(items: any[], playlistId: string) {
  async function quickSort(arrayToSort: any[], low: number, high: number) {
    const instanceArray = [...arrayToSort];
    const index = await partition(instanceArray, low, high);

    if (low < index - 1) {
      await quickSort(instanceArray, low, index - 1);
    }
    if (index < high) {
      await quickSort(instanceArray, index, high);
    }
  }

  async function partition(arrayToSort: any[], low: number, high: number) {
    const pivot = arrayToSort[Math.floor((low + high) / 2)];

    while (low <= high) {
      while (arrayToSort[low] < pivot) {
        low++;
      }
      while (arrayToSort[high] > pivot) {
        high--;
      }

      if (low <= high) {
        await swap(arrayToSort, low, high);
        low++;
        high--;
      }
    }
    return low;
  }

  async function swap(arrayToSort: any[], low: number, high: number) {
    const lowValue = arrayToSort[low];
    arrayToSort[low] = arrayToSort[high];
    arrayToSort[high] = lowValue;

    await apiCall(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'PUT',
      body: JSON.stringify({
        range_start: low,
        insert_before: high + 1,
      }),
    });

    await apiCall(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'PUT',
      body: JSON.stringify({
        range_start: high - 1 > 0 ? high - 1 : 0,
        insert_before: low,
      }),
    });

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  const tracks = items.map(({ track }) => formatCompareValue(track));

  if (!isArraySorted(tracks)) {
    await quickSort(tracks, 0, tracks.length - 1);

    return 'sorted';
  } else {
    return 'is-sorted';
  }
}

export async function lastSort(items: any[], playlistId: string, amount = 95) {
  const tracks = items.map(({ track }) => formatCompareValue(track));

  const newItems: any[] = [];

  for (let index = tracks.length - 1; index > 0; index--) {
    const item = tracks[index];

    if (tracks.slice(Math.max(index - (amount + 5), 0), index).some((prevItem) => item < prevItem)) {
      newItems.push(item);
    } else {
      break;
    }
  }

  if (newItems.length === 0) return 0;

  for (const item of newItems) {
    const newIndex = tracks.findIndex((t) => t > item);

    await apiCall(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'PUT',
      body: JSON.stringify({
        range_start: tracks.length - 1,
        insert_before: newIndex,
      }),
    });

    tracks.splice(newIndex, 0, item);
    tracks.splice(-1, 1);
  }

  return newItems.length;
}

export async function jsSort(items: any[], playlistId: string) {
  const tracks = items
    .map((item) => ({ ...item, sortValue: formatCompareValue(item.track) }))
    .sort((a, b) => {
      if (a.sortValue < b.sortValue) return -1;
      if (a.sortValue > b.sortValue) return 1;
      return 0;
    });

  if (isArraySorted(items.map(({ track }) => formatCompareValue(track)))) return 'is-sorted';

  const nonLocalTracks = tracks.filter(({ track }) => !track.is_local);
  const chunkedTracks = chunk(nonLocalTracks, 100);

  for (const chunk of chunkedTracks) {
    await apiCall(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'DELETE',
      body: JSON.stringify({
        tracks: chunk.map(({ track }) => ({ uri: track.uri })),
      }),
    });

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  for (const chunk of chunkedTracks.reverse()) {
    await apiCall(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({
        uris: chunk.map(({ track }) => track.uri),
        position: 0,
      }),
    });

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  const localTracks = tracks.filter(({ track }) => track.is_local);
  await lastSort([...nonLocalTracks, ...localTracks], playlistId, localTracks.length);

  return 'sorted';
}
