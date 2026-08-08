import type { PlaylistedTrack, SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";

import { getPlaylistTracks, getPlaylistTracksInBackground } from "./actions";

type PlaylistTracks = PlaylistedTrack<Track>[];

interface PlaylistTrackCacheDependencies {
  load: (playlist: SimplifiedPlaylist) => Promise<PlaylistTracks>;
  loadInBackground: (playlist: SimplifiedPlaylist, signal: AbortSignal) => Promise<PlaylistTracks>;
}

interface InFlightPlaylistTracks {
  promise: Promise<PlaylistTracks>;
  source: "foreground" | "background";
  cancel?: () => void;
}

export interface PlaylistTrackCache {
  get: (playlist: SimplifiedPlaylist) => Promise<PlaylistTracks>;
  set: (playlistId: string, tracks: PlaylistTracks) => void;
  invalidate: (playlistId: string) => void;
  startPrefetch: (playlists: SimplifiedPlaylist[]) => void;
  dispose: () => void;
}

const LARGE_PLAYLIST_SIZE = 5_000;

export function createPlaylistTrackCache(
  dependencies: PlaylistTrackCacheDependencies = {
    load: getPlaylistTracks,
    loadInBackground: getPlaylistTracksInBackground,
  },
): PlaylistTrackCache {
  const completedTracks = new Map<string, PlaylistTracks>();
  const inFlightTracks = new Map<string, InFlightPlaylistTracks>();

  let generation = 0;
  let prefetchController: AbortController | undefined;
  let prefetchStartTimer: number | undefined;
  let disposalTimer: number | undefined;

  const get = (playlist: SimplifiedPlaylist) => {
    const completed = completedTracks.get(playlist.id);
    if (completed) return Promise.resolve(completed);

    const inFlight = inFlightTracks.get(playlist.id);
    if (inFlight?.source === "foreground") return inFlight.promise;

    if (inFlight) {
      inFlight.cancel?.();
      if (inFlightTracks.get(playlist.id) === inFlight) inFlightTracks.delete(playlist.id);
    }

    const loadGeneration = generation;
    const promise = dependencies
      .load(playlist)
      .then((tracks) => {
        if (generation === loadGeneration) completedTracks.set(playlist.id, tracks);

        return tracks;
      })
      .finally(() => {
        if (inFlightTracks.get(playlist.id)?.promise === promise) inFlightTracks.delete(playlist.id);
      });

    inFlightTracks.set(playlist.id, { promise, source: "foreground" });

    return promise;
  };

  const set = (playlistId: string, tracks: PlaylistTracks) => {
    completedTracks.set(playlistId, tracks);
  };

  const invalidate = (playlistId: string) => {
    completedTracks.delete(playlistId);
  };

  const startBackgroundLoad = (playlist: SimplifiedPlaylist, signal: AbortSignal, loadGeneration: number) => {
    const existing = inFlightTracks.get(playlist.id);
    if (existing) return existing.promise;

    const controller = new AbortController();
    const abortLoad = () => controller.abort();

    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", abortLoad, { once: true });

    const promise = dependencies
      .loadInBackground(playlist, controller.signal)
      .then((tracks) => {
        if (!controller.signal.aborted && generation === loadGeneration) completedTracks.set(playlist.id, tracks);

        return tracks;
      })
      .finally(() => {
        signal.removeEventListener("abort", abortLoad);
        if (inFlightTracks.get(playlist.id)?.promise === promise) inFlightTracks.delete(playlist.id);
      });

    inFlightTracks.set(playlist.id, { promise, source: "background", cancel: abortLoad });

    return promise;
  };

  const runPrefetchQueue = async (playlists: SimplifiedPlaylist[], signal: AbortSignal, loadGeneration: number) => {
    for (const playlist of playlists) {
      if (signal.aborted || generation !== loadGeneration) return;
      if (completedTracks.has(playlist.id)) continue;

      try {
        await (inFlightTracks.get(playlist.id)?.promise ?? startBackgroundLoad(playlist, signal, loadGeneration));
      } catch (error) {
        if (isRateLimitError(error)) return;

        const replacement = inFlightTracks.get(playlist.id);
        if (isAbortError(error)) {
          if (replacement?.source !== "foreground") return;

          try {
            await replacement.promise;
          } catch {}
        }
      }
    }
  };

  const stopPrefetch = () => {
    prefetchController?.abort();
    prefetchController = undefined;

    for (const [playlistId, inFlight] of inFlightTracks) {
      if (inFlight.source !== "background") continue;

      inFlight.cancel?.();
      inFlightTracks.delete(playlistId);
    }

    if (prefetchStartTimer !== undefined) {
      window.clearTimeout(prefetchStartTimer);
      prefetchStartTimer = undefined;
    }
  };

  const startPrefetch = (playlists: SimplifiedPlaylist[]) => {
    if (disposalTimer !== undefined) {
      window.clearTimeout(disposalTimer);
      disposalTimer = undefined;
    }

    stopPrefetch();

    const largePlaylists = playlists.filter((playlist) => (playlist.items?.total ?? 0) > LARGE_PLAYLIST_SIZE);
    if (largePlaylists.length === 0) return;

    const controller = new AbortController();
    const loadGeneration = generation;
    prefetchController = controller;
    prefetchStartTimer = window.setTimeout(() => {
      prefetchStartTimer = undefined;
      void runPrefetchQueue(largePlaylists, controller.signal, loadGeneration);
    }, 0);
  };

  const dispose = () => {
    stopPrefetch();
    generation++;

    disposalTimer = window.setTimeout(() => {
      completedTracks.clear();
      inFlightTracks.clear();
      disposalTimer = undefined;
    }, 0);
  };

  return { get, set, invalidate, startPrefetch, dispose };
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function isRateLimitError(error: unknown) {
  return typeof error === "object" && error !== null && "status" in error && error.status === 429;
}
