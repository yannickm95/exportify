import type { PlaylistedTrack, SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getPlaylistTracks, getPlaylistTracksInBackground, jsSort, lastSort, quickSortPlaylist } from "./actions";

const spotifyMocks = vi.hoisted(() => ({
  getPlaylistItems: vi.fn(),
  updatePlaylistItems: vi.fn(),
}));

vi.mock("./api", () => ({
  sdk: {
    playlists: spotifyMocks,
  },
}));

describe("playlist track fetching", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("window", {
      clearTimeout: globalThis.clearTimeout,
      setTimeout: globalThis.setTimeout,
    });
    spotifyMocks.getPlaylistItems.mockResolvedValue({ items: [] });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("splits an uncached large foreground load into two groups five seconds apart", async () => {
    const load = getPlaylistTracks(createPlaylist("large", 5_001));

    await vi.advanceTimersByTimeAsync(200);
    expect(spotifyMocks.getPlaylistItems).toHaveBeenCalledTimes(51);

    await vi.advanceTimersByTimeAsync(4_999);
    expect(spotifyMocks.getPlaylistItems).toHaveBeenCalledTimes(51);

    await vi.advanceTimersByTimeAsync(1);
    expect(spotifyMocks.getPlaylistItems).toHaveBeenCalledTimes(76);

    await vi.runAllTimersAsync();
    await load;
    expect(spotifyMocks.getPlaylistItems).toHaveBeenCalledTimes(101);
  });

  it("fetches background tracks in one-thousand-track waves 7.5 seconds apart", async () => {
    const load = getPlaylistTracksInBackground(createPlaylist("background", 2_001), new AbortController().signal);

    await vi.advanceTimersByTimeAsync(0);
    expect(spotifyMocks.getPlaylistItems).toHaveBeenCalledTimes(20);

    await vi.advanceTimersByTimeAsync(2_499);
    expect(spotifyMocks.getPlaylistItems).toHaveBeenCalledTimes(20);

    await vi.advanceTimersByTimeAsync(1);
    expect(spotifyMocks.getPlaylistItems).toHaveBeenCalledTimes(40);

    await vi.advanceTimersByTimeAsync(2_500);
    await load;
    expect(spotifyMocks.getPlaylistItems).toHaveBeenCalledTimes(41);
  });
});

describe("playlist sorting", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("window", {
      clearTimeout: globalThis.clearTimeout,
      setTimeout: globalThis.setTimeout,
    });
    spotifyMocks.updatePlaylistItems.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("returns the exact resulting quicksort order", async () => {
    const second = createTrack("second", "B");
    const first = createTrack("first", "A");
    const sorting = quickSortPlaylist([second, first], "playlist");

    await vi.runAllTimersAsync();
    const outcome = await sorting;

    expect(outcome.result).toBe("sorted");
    expect(outcome.tracks).toEqual([first, second]);
    expect(spotifyMocks.updatePlaylistItems).toHaveBeenCalledTimes(2);
  });

  it("returns cacheable tracks when a playlist is already sorted", async () => {
    const first = createTrack("first", "A");
    const second = createTrack("second", "B");

    const quickSortOutcome = await quickSortPlaylist([first, second], "playlist");
    const jsSortOutcome = await jsSort([first, second], "playlist");
    const lastSortOutcome = await lastSort([first, second], "playlist");

    expect(quickSortOutcome).toEqual({ result: "is-sorted", tracks: [first, second] });
    expect(jsSortOutcome).toEqual({ result: "is-sorted", tracks: [first, second] });
    expect(lastSortOutcome).toEqual({ result: 0, tracks: [first, second] });
    expect(spotifyMocks.updatePlaylistItems).not.toHaveBeenCalled();
  });
});

function createPlaylist(id: string, total: number) {
  return { id, items: { total } } as SimplifiedPlaylist;
}

function createTrack(uri: string, artistName: string) {
  return {
    item: {
      uri,
      track_number: 1,
      artists: [{ name: artistName }],
      album: { name: "Album", release_date: "2020" },
    },
  } as PlaylistedTrack<Track>;
}
