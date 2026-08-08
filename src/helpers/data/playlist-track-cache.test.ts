import type { PlaylistedTrack, SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createPlaylistTrackCache } from "./playlist-track-cache";
import { SpotifyResponseError } from "./spotify-response-validator";

const tracks = [{ item: { uri: "spotify:track:1" } }] as PlaylistedTrack<Track>[];

describe("playlist track cache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("window", {
      clearTimeout: globalThis.clearTimeout,
      setTimeout: globalThis.setTimeout,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("shares in-flight foreground loads and caches completed tracks", async () => {
    let resolveLoad!: (value: PlaylistedTrack<Track>[]) => void;
    const load = vi.fn(
      () =>
        new Promise<PlaylistedTrack<Track>[]>((resolve) => {
          resolveLoad = resolve;
        }),
    );
    const cache = createPlaylistTrackCache({
      load,
      loadInBackground: vi.fn(),
    });
    const playlist = createPlaylist("shared", 100);

    const firstLoad = cache.get(playlist);
    const secondLoad = cache.get(playlist);

    expect(secondLoad).toBe(firstLoad);
    expect(load).toHaveBeenCalledOnce();

    resolveLoad(tracks);
    await expect(firstLoad).resolves.toBe(tracks);
    await expect(cache.get(playlist)).resolves.toBe(tracks);
    expect(load).toHaveBeenCalledOnce();
  });

  it("preserves data during a Strict Mode remount and clears it after route disposal", async () => {
    const load = vi.fn().mockResolvedValue(tracks);
    const cache = createPlaylistTrackCache({ load, loadInBackground: vi.fn() });
    const playlist = createPlaylist("route", 100);

    await cache.get(playlist);
    cache.dispose();
    cache.startPrefetch([]);
    await cache.get(playlist);

    expect(load).toHaveBeenCalledOnce();

    cache.dispose();
    await vi.runAllTimersAsync();
    await cache.get(playlist);

    expect(load).toHaveBeenCalledTimes(2);
  });

  it("silently stops the entire background queue after a rate-limit error", async () => {
    const loadInBackground = vi
      .fn()
      .mockRejectedValueOnce(new SpotifyResponseError(429, "Any response message"))
      .mockResolvedValue(tracks);
    const cache = createPlaylistTrackCache({ load: vi.fn(), loadInBackground });

    cache.startPrefetch([createPlaylist("first", 5_001), createPlaylist("second", 6_000)]);
    await vi.runAllTimersAsync();

    expect(loadInBackground).toHaveBeenCalledOnce();
  });

  it("continues the background queue after a non-rate-limit error", async () => {
    const loadInBackground = vi
      .fn()
      .mockRejectedValueOnce(new SpotifyResponseError(500, "The app has exceeded its rate limits."))
      .mockResolvedValue(tracks);
    const cache = createPlaylistTrackCache({ load: vi.fn(), loadInBackground });

    cache.startPrefetch([createPlaylist("first", 5_001), createPlaylist("second", 6_000)]);
    await vi.runAllTimersAsync();

    expect(loadInBackground).toHaveBeenCalledTimes(2);
  });
});

function createPlaylist(id: string, total: number) {
  return { id, items: { total } } as SimplifiedPlaylist;
}
