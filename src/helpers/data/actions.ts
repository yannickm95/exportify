import type { Artist, MaxInt, PlaylistedTrack, SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";
import { saveAs } from "file-saver";
import chunk from "lodash/chunk";

import { sdk } from "./api";
import { convertArtistsToCsv, convertTracksToCsv, fileName, formatCompareValue, isArraySorted } from "./utils";

export function getUser() {
  return sdk.currentUser.profile();
}

const PLAYLIST_LIMIT = 20;

export async function getPlaylists() {
  const loadSlice = async (start: number, end: number) => {
    return await sdk.currentUser.playlists.playlists((end - start) as MaxInt<50>, start);
  };

  const { items, total } = await loadSlice(0, PLAYLIST_LIMIT);

  let playlists = items;

  for (let offset = PLAYLIST_LIMIT; offset < total; offset = offset + PLAYLIST_LIMIT) {
    const { items } = await loadSlice(offset, offset + PLAYLIST_LIMIT);
    playlists = [...playlists, ...items];
  }

  return playlists;
}

export async function getPlaylistTracks(playlist: SimplifiedPlaylist) {
  const args: { id: string; limit: number; offset: number }[] = [];
  const limit = 100;

  for (let offset = 0; offset < playlist.tracks!.total; offset = offset + limit) {
    args.push({ id: playlist.id, limit, offset });
  }

  const trackResponses = await Promise.all(
    args.map(({ id, limit, offset }) =>
      sdk.playlists.getPlaylistItems(id, undefined, undefined, limit as MaxInt<50>, offset),
    ),
  );

  return trackResponses.flatMap((response) => response.items);
}

export async function getFollowedArtists() {
  let artists: Artist[] = [];
  let after: string | null = "";

  while (typeof after === "string") {
    const { artists: response } = await sdk.currentUser.followedArtists(after);
    after = new URLSearchParams(response.next || "").get("after") || null;
    artists = [...artists, ...response.items];
  }

  return artists;
}

export function exportToCsv<T extends "tracks" | "artists">(
  input: T extends "tracks" ? PlaylistedTrack<Track>[] : Artist[],
  name: string,
  type: T,
) {
  const converter = type === "tracks" ? convertTracksToCsv : convertArtistsToCsv;
  const blob = new Blob([converter(input as any[])], { type: "text/csv;charset=utf-8" });

  saveAs(blob, fileName(name));
}

export async function quickSortPlaylist(items: PlaylistedTrack<Track>[], playlistId: string) {
  async function quickSort(arrayToSort: string[], low: number, high: number) {
    const instanceArray = [...arrayToSort];
    const index = await partition(instanceArray, low, high);

    if (low < index - 1) {
      await quickSort(instanceArray, low, index - 1);
    }
    if (index < high) {
      await quickSort(instanceArray, index, high);
    }
  }

  async function partition(arrayToSort: string[], low: number, high: number) {
    const pivot = arrayToSort[Math.floor((low + high) / 2)];

    while (low <= high) {
      while (arrayToSort[low]! < pivot!) {
        low++;
      }
      while (arrayToSort[high]! > pivot!) {
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

  async function swap(arrayToSort: string[], low: number, high: number) {
    const lowValue = arrayToSort[low]!;
    arrayToSort[low] = arrayToSort[high]!;
    arrayToSort[high] = lowValue;

    await sdk.playlists.updatePlaylistItems(playlistId, {
      range_start: low,
      insert_before: high + 1,
    });
    await sdk.playlists.updatePlaylistItems(playlistId, {
      range_start: high - 1 > 0 ? high - 1 : 0,
      insert_before: low,
    });

    await new Promise((resolve) => {
      window.setTimeout(resolve, 200);
    });
  }

  const tracks = items.map(({ track }) => formatCompareValue(track));

  if (!isArraySorted(tracks)) {
    await quickSort(tracks, 0, tracks.length - 1);

    return "sorted";
  } else {
    return "is-sorted";
  }
}

export async function lastSort(items: PlaylistedTrack<Track>[], playlistId: string, amount = 95) {
  const tracks = items.map(({ track }) => formatCompareValue(track));

  const newItems: string[] = [];

  for (let index = tracks.length - 1; index > 0; index--) {
    const item = tracks[index];

    if (item && tracks.slice(Math.max(index - (amount + 5), 0), index).some((prevItem) => item < prevItem)) {
      newItems.push(item);
    } else {
      break;
    }
  }

  if (newItems.length === 0) return 0;

  for (const item of newItems) {
    const newIndex = tracks.findIndex((t) => t > item);

    await sdk.playlists.updatePlaylistItems(playlistId, {
      range_start: tracks.length - 1,
      insert_before: newIndex,
    });

    tracks.splice(newIndex, 0, item);
    tracks.splice(-1, 1);
  }

  return newItems.length;
}

export async function jsSort(items: PlaylistedTrack<Track>[], playlistId: string) {
  const tracks = items
    .map((item) => ({ ...item, sortValue: formatCompareValue(item.track) }))
    .toSorted((a, b) => {
      if (a.sortValue < b.sortValue) return -1;
      if (a.sortValue > b.sortValue) return 1;

      return 0;
    });

  if (isArraySorted(items.map(({ track }) => formatCompareValue(track)))) return "is-sorted";

  const nonLocalTracks = tracks.filter(({ track }) => !track.is_local);
  const chunkedTracks = chunk(nonLocalTracks, 100);

  for (const chunk of chunkedTracks) {
    await sdk.playlists.removeItemsFromPlaylist(playlistId, { tracks: chunk.map(({ track }) => ({ uri: track.uri })) });

    await new Promise((resolve) => {
      window.setTimeout(resolve, 200);
    });
  }

  for (const chunk of chunkedTracks.reverse()) {
    await sdk.playlists.addItemsToPlaylist(
      playlistId,
      chunk.map(({ track }) => track.uri),
      0,
    );

    await new Promise((resolve) => {
      window.setTimeout(resolve, 200);
    });
  }

  const localTracks = tracks.filter(({ track }) => track.is_local);
  await lastSort([...nonLocalTracks, ...localTracks], playlistId, localTracks.length);

  return "sorted";
}
