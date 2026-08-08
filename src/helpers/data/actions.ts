import type { Artist, MaxInt, PlaylistedTrack, SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";
import { saveAs } from "file-saver";
import chunk from "lodash/chunk";

import { sdk } from "./api";
import { convertArtistsToCsv, convertTracksToCsv, fileName, formatCompareValue, isArraySorted } from "./utils";

export function getUser() {
  return sdk.currentUser.profile();
}

const PLAYLIST_LIMIT = 20;
const PLAYLIST_TRACK_LIMIT: MaxInt<50> = 50;
const LARGE_PLAYLIST_SIZE = 5_000;
const BACKGROUND_TRACK_BATCH_SIZE = 1_000;
const REQUEST_BATCH_SIZE = 25;
const REQUEST_BATCH_DELAY = 100;
const LARGE_PLAYLIST_DELAY = 5_000;
const LARGE_PLAYLIST_BACKGROUND_DELAY = 7_500;

interface PlaylistTrackRequest {
  id: string;
  limit: MaxInt<50>;
  offset: number;
}

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
  const requests = createPlaylistTrackRequests(playlist);
  const tracks: PlaylistedTrack<Track>[] = [];
  const requestGroups =
    playlist.items!.total > LARGE_PLAYLIST_SIZE ? chunk(requests, Math.ceil(requests.length / 2)) : [requests];

  for (const [groupIndex, requestGroup] of requestGroups.entries()) {
    if (groupIndex > 0) await wait(LARGE_PLAYLIST_DELAY);

    tracks.push(...(await fetchPlaylistTrackRequests(requestGroup)));
  }

  return tracks;
}

export async function getPlaylistTracksInBackground(playlist: SimplifiedPlaylist, signal: AbortSignal) {
  const requests = createPlaylistTrackRequests(playlist);
  const requestGroups = chunk(requests, BACKGROUND_TRACK_BATCH_SIZE / PLAYLIST_TRACK_LIMIT);
  const tracks: PlaylistedTrack<Track>[] = [];

  for (const [groupIndex, requestGroup] of requestGroups.entries()) {
    throwIfAborted(signal);
    if (groupIndex > 0) await wait(LARGE_PLAYLIST_BACKGROUND_DELAY, signal);

    tracks.push(...(await fetchPlaylistTrackRequests(requestGroup)));

    throwIfAborted(signal);
  }

  return tracks;
}

function createPlaylistTrackRequests(playlist: SimplifiedPlaylist) {
  const requests: PlaylistTrackRequest[] = [];

  for (let offset = 0; offset < playlist.items!.total; offset = offset + PLAYLIST_TRACK_LIMIT) {
    requests.push({ id: playlist.id, limit: PLAYLIST_TRACK_LIMIT, offset });
  }

  return requests;
}

async function fetchPlaylistTrackRequests(requests: PlaylistTrackRequest[]) {
  const tracks: PlaylistedTrack<Track>[] = [];

  for (const [batchIndex, requestBatch] of chunk(requests, REQUEST_BATCH_SIZE).entries()) {
    if (batchIndex > 0) await wait(REQUEST_BATCH_DELAY);

    const responses = await Promise.all(
      requestBatch.map(({ id, limit, offset }) =>
        sdk.playlists.getPlaylistItems(id, undefined, undefined, limit, offset),
      ),
    );

    tracks.push(...responses.flatMap((response) => response.items));
  }

  return tracks;
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException("Background fetch aborted", "AbortError");
}

function wait(delay: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(resolve, delay);

    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeoutId);
        reject(new DOMException("Background fetch aborted", "AbortError"));
      },
      { once: true },
    );
  });
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

export interface PlaylistSortOutcome<T extends "sorted" | "is-sorted" | number> {
  result: T;
  tracks: PlaylistedTrack<Track>[];
}

export async function quickSortPlaylist(items: PlaylistedTrack<Track>[], playlistId: string) {
  const orderedItems = [...items];

  async function quickSort(low: number, high: number) {
    const index = await partition(low, high);

    if (low < index - 1) {
      await quickSort(low, index - 1);
    }
    if (index < high) {
      await quickSort(index, high);
    }
  }

  async function partition(low: number, high: number) {
    const pivot = formatCompareValue(orderedItems[Math.floor((low + high) / 2)]!.item);

    while (low <= high) {
      while (formatCompareValue(orderedItems[low]!.item) < pivot) {
        low++;
      }
      while (formatCompareValue(orderedItems[high]!.item) > pivot) {
        high--;
      }

      if (low <= high) {
        await swap(low, high);
        low++;
        high--;
      }
    }

    return low;
  }

  async function swap(low: number, high: number) {
    if (low === high) return;

    await sdk.playlists.updatePlaylistItems(playlistId, {
      range_start: low,
      insert_before: high + 1,
    });
    await sdk.playlists.updatePlaylistItems(playlistId, {
      range_start: high - 1 > 0 ? high - 1 : 0,
      insert_before: low,
    });

    const lowValue = orderedItems[low]!;
    orderedItems[low] = orderedItems[high]!;
    orderedItems[high] = lowValue;

    await wait(200);
  }

  const compareValues = items.map(({ item }) => formatCompareValue(item));

  if (!isArraySorted(compareValues)) {
    await quickSort(0, orderedItems.length - 1);

    return { result: "sorted", tracks: orderedItems } satisfies PlaylistSortOutcome<"sorted">;
  } else {
    return { result: "is-sorted", tracks: orderedItems } satisfies PlaylistSortOutcome<"is-sorted">;
  }
}

export async function lastSort(items: PlaylistedTrack<Track>[], playlistId: string, amount = 95) {
  const orderedItems = [...items];
  const tracks = items.map(({ item }) => formatCompareValue(item));

  const newItems: string[] = [];

  for (let index = tracks.length - 1; index > 0; index--) {
    const item = tracks[index];

    if (item && tracks.slice(Math.max(index - (amount + 5), 0), index).some((prevItem) => item < prevItem)) {
      newItems.push(item);
    } else {
      break;
    }
  }

  if (newItems.length === 0) {
    return { result: 0, tracks: orderedItems } satisfies PlaylistSortOutcome<number>;
  }

  for (const item of newItems) {
    const newIndex = tracks.findIndex((t) => t > item);

    await sdk.playlists.updatePlaylistItems(playlistId, {
      range_start: tracks.length - 1,
      insert_before: newIndex,
    });

    tracks.splice(newIndex, 0, item);
    tracks.splice(-1, 1);

    const movedTrack = orderedItems.pop()!;
    orderedItems.splice(newIndex, 0, movedTrack);
  }

  return { result: newItems.length, tracks: orderedItems } satisfies PlaylistSortOutcome<number>;
}

export async function jsSort(items: PlaylistedTrack<Track>[], playlistId: string) {
  const tracks = items
    .map((playlistItem) => ({ ...playlistItem, sortValue: formatCompareValue(playlistItem.item) }))
    .toSorted((a, b) => {
      if (a.sortValue < b.sortValue) return -1;
      if (a.sortValue > b.sortValue) return 1;

      return 0;
    });

  if (isArraySorted(items.map(({ item }) => formatCompareValue(item)))) {
    return { result: "is-sorted", tracks: [...items] } satisfies PlaylistSortOutcome<"is-sorted">;
  }

  const nonLocalTracks = tracks.filter(({ item }) => !item.is_local);
  const chunkedTracks = chunk(nonLocalTracks, 100);

  for (const chunk of chunkedTracks) {
    await sdk.playlists.removeItemsFromPlaylist(playlistId, { items: chunk.map(({ item }) => ({ uri: item.uri })) });

    await wait(200);
  }

  for (const chunk of chunkedTracks.reverse()) {
    await sdk.playlists.addItemsToPlaylist(
      playlistId,
      chunk.map(({ item }) => item.uri),
      0,
    );

    await wait(200);
  }

  const localTracks = tracks.filter(({ item }) => item.is_local);
  const { tracks: sortedTracks } = await lastSort([...nonLocalTracks, ...localTracks], playlistId, localTracks.length);

  return { result: "sorted", tracks: sortedTracks } satisfies PlaylistSortOutcome<"sorted">;
}
