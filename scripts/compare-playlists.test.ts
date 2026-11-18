import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

const script = fileURLToPath(new URL("./compare-playlists.ts", import.meta.url));
const headers = ["Track URI", "Track Name", "Artist Name(s)"];
let directory: string;

function csv(rows: string[][]) {
  return rows.map((row) => row.map((field) => `"${field.replaceAll('"', '""')}"`).join(",")).join("\r\n");
}

function fixture(name: string, content: string) {
  const path = join(directory, name);
  writeFileSync(path, content);
  return path;
}

function run(...args: string[]) {
  const result = spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
  if (result.error) throw result.error;
  return result;
}

describe("compare playlists CLI", () => {
  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "exportify-compare-"));
  });

  afterEach(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  it("matches names and artists regardless of URI, case, or outer whitespace, once in first-file order", () => {
    const first = fixture(
      "first playlist.csv",
      csv([
        headers,
        ["uri:1", " Second song ", " Artist B "],
        ["uri:2", "First song", "Artist A"],
        ["uri:3", "SECOND SONG", "ARTIST B"],
        ["uri:4", "First song", "Different artist"],
        ["uri:5", "Only in first", "Artist A"],
      ]),
    );
    const second = fixture(
      "second.csv",
      csv([
        ["Artist Name(s)", "Track URI", "Track Name"],
        ["ARTIST A", "other:1", "FIRST SONG"],
        ["artist b", "other:2", "second song"],
        ["artist b", "other:3", "second song"],
      ]),
    );

    const result = run(first, second);

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toBe("Artist B - Second song\nArtist A - First song\n\nShared tracks: 2\n");
  });

  it("handles BOM, quoted commas, escaped quotes, multiline fields, and non-ASCII text", () => {
    const content = csv([headers, ["uri:1", 'Café, "live"\nversion', "Björk; Guest"]]);
    const first = fixture("first.csv", `\uFEFF${content}`);
    const second = fixture("second.csv", csv([headers, ["uri:2", 'CAFÉ, "LIVE"\nVERSION', "BJÖRK; GUEST"]]));

    const result = run(first, second);

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toBe('Björk; Guest - Café, "live"\nversion\n\nShared tracks: 1\n');
  });

  it.each<[string, string[][]]>([
    ["different artists", [["uri:2", "Song", "Other artist"]]],
    ["different artist order", [["uri:2", "Song", "Guest; Artist"]]],
    ["different internal whitespace", [["uri:2", "Song", "Artist;  Guest"]]],
    ["empty playlist", []],
  ])("reports no matches for %s", (_description, rows) => {
    const first = fixture("first.csv", csv([headers, ["uri:1", "Song", "Artist; Guest"]]));
    const second = fixture("second.csv", csv([headers, ...rows]));

    const result = run(first, second);

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toBe("No shared tracks found.\n\nShared tracks: 0\n");
  });

  it.each([
    ["empty file", "", "Track Name"],
    ["missing column", csv([["Track Name"], ["Song"]]), "Artist Name(s)"],
    ["duplicate column", csv([["Track Name", "Track Name", "Artist Name(s)"]]), "Track Name"],
    ["missing field", csv([headers]) + '\n"uri:1","Song"', "Invalid Record Length"],
    ["blank name", csv([headers, ["uri:1", " ", "Artist"]]), "must have a track name and artist"],
    ["blank artist", csv([headers, ["uri:1", "Song", " "]]), "must have a track name and artist"],
    ["malformed quoting", csv([headers]) + '\n"unterminated', "Quote Not Closed"],
  ])("rejects %s without printing partial results", (_description, content, message) => {
    const first = fixture("first.csv", csv([headers, ["uri:1", "Song", "Artist"]]));
    const second = fixture("invalid.csv", content);

    const result = run(first, second);

    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain(second);
    expect(result.stderr).toContain(message);
  });

  it("reports unreadable files", () => {
    const missing = join(directory, "missing.csv");
    const result = run(missing, missing);

    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain(missing);
    expect(result.stderr).toContain("ENOENT");
  });

  it.each([false, true])("resolves relative CSV paths from the caller's folder with pnpm=%s", (usePnpm) => {
    const content = csv([headers, ["uri:1", "Song", "Artist"]]);
    fixture("first.csv", content);
    fixture("second.csv", content);
    const projectRoot = fileURLToPath(new URL("../", import.meta.url));
    const result = spawnSync(
      usePnpm ? "pnpm" : process.execPath,
      usePnpm
        ? ["--dir", projectRoot, "compare-playlists", "first.csv", "second.csv"]
        : [script, "first.csv", "second.csv"],
      {
        cwd: directory,
        env: { ...process.env, INIT_CWD: undefined },
        encoding: "utf8",
      },
    );
    if (result.error) throw result.error;

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Artist - Song\n\nShared tracks: 1\n");
  });

  it.each([{ args: [] }, { args: ["one.csv"] }, { args: ["one.csv", "two.csv", "three.csv"] }])(
    "rejects invalid arguments $args",
    ({ args }) => {
      const result = run(...args);

      expect(result.status).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toContain("Usage:");
    },
  );

  it("prints help successfully", () => {
    const result = run("--help");

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Usage:");
  });
});
