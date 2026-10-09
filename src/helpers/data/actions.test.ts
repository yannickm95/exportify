import type { PlaylistedTrack, SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getPlaylistTracks, getPlaylistTracksInBackground, jsSort, lastSort, quickSortPlaylist } from "./actions";

const spotifyMocks = vi.hoisted(() => ({
  addItemsToPlaylist: vi.fn(),
  getPlaylistItems: vi.fn(),
  removeItemsFromPlaylist: vi.fn(),
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

  it("moves stray tracks to the bottom before last-sorting them", async () => {
    const [a, z, b, c, e, d] = ["A", "Z", "B", "C", "E", "D"].map((name) => createTrack(name, name));

    const outcome = await lastSort([a!, z!, b!, c!, e!, d!], "playlist");

    expect(outcome).toEqual({ result: 2, tracks: [a, b, c, d, e, z] });
    expect(spotifyMocks.updatePlaylistItems.mock.calls).toEqual([
      ["playlist", { range_start: 1, insert_before: 6 }],
      ["playlist", { range_start: 5, insert_before: 4 }],
      ["playlist", { range_start: 5, insert_before: 3 }],
    ]);
  });

  it("moves out-of-place local files into place", async () => {
    const [a, local, b] = [createTrack("a", "A"), createTrack("local", "Z", true), createTrack("b", "B")];

    const outcome = await lastSort([a!, local!, b!], "playlist");

    expect(outcome).toEqual({ result: 1, tracks: [a, b, local] });
    expect(spotifyMocks.updatePlaylistItems.mock.calls).toEqual([["playlist", { range_start: 2, insert_before: 1 }]]);
  });

  it("inserts local files after js-sorting the other tracks", async () => {
    const [a, local, b] = [createTrack("a", "A"), createTrack("local", "AB", true), createTrack("b", "B")];
    const sorting = jsSort([b!, local!, a!], "playlist");

    await vi.runAllTimersAsync();
    const outcome = await sorting;

    expect(outcome.result).toBe("sorted");
    expect(outcome.tracks.map(({ item }) => item.uri)).toEqual(["a", "local", "b"]);
    expect(spotifyMocks.updatePlaylistItems.mock.calls).toEqual([["playlist", { range_start: 2, insert_before: 1 }]]);
  });
});

function createPlaylist(id: string, total: number) {
  return { id, items: { total } } as SimplifiedPlaylist;
}

function createTrack(uri: string, artistName: string, isLocal = false) {
  return {
    item: {
      uri,
      is_local: isLocal,
      track_number: 1,
      artists: [{ name: artistName }],
      album: { name: "Album", release_date: "2020" },
    },
  } as PlaylistedTrack<Track>;
}
