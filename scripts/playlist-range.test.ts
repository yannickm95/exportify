import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

const script = fileURLToPath(new URL("./playlist-range.ts", import.meta.url));
const headers = ["Track Name", "Artist Name(s)", "Album Release Date"];
let directory: string;

function csv(rows: string[][]) {
  return rows.map((row) => row.map((field) => `"${field.replaceAll('"', '""')}"`).join(",")).join("\r\n");
}

function fixture(content: string) {
  const path = join(directory, "playlist.csv");
  writeFileSync(path, content);
  return path;
}

function run(...args: string[]) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: directory,
    env: { ...process.env, INIT_CWD: undefined },
    encoding: "utf8",
  });
  if (result.error) throw result.error;
  return result;
}

describe("playlist release-year CLI", () => {
  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "exportify-range-"));
  });

  afterEach(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  it("reports ascending year counts, including duplicates, partial dates, and unknown years", () => {
    const path = fixture(
      csv([
        headers,
        ["Newest", "Artist", "2000-12-31"],
        ["Oldest", "Artist", "1989"],
        ["Middle", "Artist", "1990-06"],
        ["Middle", "Artist", "1990-06"],
        ["Unknown", "Artist", ""],
      ]),
    );

    const result = run(path, "report");

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toBe("1989: 1\n1990: 2\n2000: 1\nUnknown release year: 1\n\nTotal tracks: 5\n");
  });

  it("filters inclusively by ascending year with prefixes, preserving same-year order and duplicates", () => {
    const path = fixture(
      csv([
        headers,
        ["Upper boundary", "Artist", "2000-12-31"],
        ["Before range", "Artist", "1989-12-31"],
        ["Lower boundary", "Artist", "1990-01-01"],
        ["Same year", "Artist", "1990-12-31"],
        ["Lower boundary", "Artist", "1990-01-01"],
        ["After range", "Artist", "2001"],
        ["Unknown", "Artist", " "],
      ]),
    );

    const result = run(path, "filter", "1990-2000");

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("Skipped 1 tracks without a release year.\n");
    expect(result.stdout).toBe(
      "1990 - Artist - Lower boundary\n1990 - Artist - Same year\n1990 - Artist - Lower boundary\n2000 - Artist - Upper boundary\n\nMatching tracks: 4\n",
    );
  });

  it("handles BOM, reordered columns, quoted fields, and a single-year filter", () => {
    const path = fixture(
      `\uFEFF${csv([
        ["Album Release Date", "Artist Name(s)", "Track Name"],
        ["1996-02-29", "Björk; Guest", 'Café, "live"\nversion'],
        ["1997", "Other", "Outside"],
      ])}`,
    );

    const result = run(path, "filter", "1996-1996");

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toBe('1996 - Björk; Guest - Café, "live"\nversion\n\nMatching tracks: 1\n');
  });

  it("reports a header-only playlist and handles a filter with no matches", () => {
    const path = fixture(csv([headers]));
    const report = run(path, "report");
    const filter = run(path, "filter", "1990-2000");

    expect(report.status).toBe(0);
    expect(report.stderr).toBe("");
    expect(report.stdout).toBe("No tracks found.\n\nTotal tracks: 0\n");
    expect(filter.status).toBe(0);
    expect(filter.stderr).toBe("");
    expect(filter.stdout).toBe("No tracks found in this range.\n\nMatching tracks: 0\n");
  });

  it.each(["not a date", "1990-13", "1990-00", "1990-02-29", "2000-04-31", "0000"])(
    "rejects invalid release date %s without printing partial results",
    (date) => {
      const path = fixture(csv([headers, ["Valid", "Artist", "1990"], ["Invalid", "Artist", date]]));
      const result = run(path, "report");

      expect(result.status).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toContain(path);
      expect(result.stderr).toContain("CSV record 3 has an invalid Album Release Date");
    },
  );

  it.each([
    ["empty file", "", "Track Name"],
    ["missing column", csv([["Track Name", "Artist Name(s)"]]), "Album Release Date"],
    ["duplicate column", csv([[...headers, "Album Release Date"]]), "Album Release Date"],
    ["blank name", csv([headers, [" ", "Artist", "1990"]]), "must have a track name"],
    ["blank artist", csv([headers, ["Song", " ", "1990"]]), "must have a track name"],
    ["missing field", csv([headers]) + '\n"Song","Artist"', "Invalid Record Length"],
    ["malformed quoting", csv([headers]) + '\n"unterminated', "Quote Not Closed"],
  ])("rejects %s", (_description, content, message) => {
    const path = fixture(content);
    const result = run(path, "filter", "1990-2000");

    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain(path);
    expect(result.stderr).toContain(message);
  });

  it.each(["2000-1990", "0000-2000", "1990", "1990-2000-extra", "1990-10000"])("rejects range %s", (range) => {
    const path = fixture(csv([headers]));
    const result = run(path, "filter", range);

    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toMatch(/year range|start year/);
  });

  it.each([
    { args: [] },
    { args: ["playlist.csv"] },
    { args: ["playlist.csv", "unknown"] },
    { args: ["playlist.csv", "report", "1990-2000"] },
    { args: ["playlist.csv", "filter"] },
  ])("rejects invalid arguments $args", ({ args }) => {
    const result = run(...args);
    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Usage:");
  });

  it("reports unreadable files and prints help", () => {
    const missing = run("missing.csv", "report");
    expect(missing.status).toBe(1);
    expect(missing.stdout).toBe("");
    expect(missing.stderr).toContain("missing.csv");
    expect(missing.stderr).toContain("ENOENT");

    const help = run("--help");
    expect(help.status).toBe(0);
    expect(help.stderr).toBe("");
    expect(help.stdout).toContain("report");
    expect(help.stdout).toContain("filter");
  });

  it("resolves relative paths from the caller's folder through the pnpm command", () => {
    fixture(csv([headers, ["Song", "Artist", "1990"]]));
    const projectRoot = fileURLToPath(new URL("../", import.meta.url));
    const result = spawnSync("pnpm", ["--dir", projectRoot, "playlist-range", "playlist.csv", "report"], {
      cwd: directory,
      env: { ...process.env, INIT_CWD: undefined },
      encoding: "utf8",
    });
    if (result.error) throw result.error;

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("1990: 1\n\nTotal tracks: 1\n");
  });
});
