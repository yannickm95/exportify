import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { parse } from "csv-parse/sync";

const usage = "Usage: pnpm compare-playlists <first.csv> <second.csv>";

try {
  const args = process.argv.slice(2);
  if (args.length === 1 && (args[0] === "--help" || args[0] === "-h")) {
    console.log(usage);
    process.exit();
  }

  const [firstPath, secondPath] = args;
  if (args.length !== 2 || firstPath === undefined || secondPath === undefined) {
    throw new Error(usage);
  }

  const first = readPlaylist(firstPath);
  const second = readPlaylist(secondPath);
  const matches = [...first].filter(([key]) => second.has(key)).map(([, track]) => track);

  for (const { name, artist } of matches) {
    console.log(`${artist} - ${name}`);
  }

  if (matches.length === 0) {
    console.log("No shared tracks found.");
  }
  console.log(`\nShared tracks: ${matches.length}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

function readPlaylist(path: string) {
  try {
    const [headers, ...rows] = parse(readFileSync(resolve(process.env.INIT_CWD ?? process.cwd(), path), "utf8"), {
      bom: true,
      skip_empty_lines: true,
    });
    if (!headers) {
      throw new Error('Expected exactly one "Track Name" column.');
    }

    const requiredHeaders = ["Track Name", "Artist Name(s)"];

    for (const header of requiredHeaders) {
      if (headers.filter((value) => value === header).length !== 1) {
        throw new Error(`Expected exactly one "${header}" column.`);
      }
    }

    const nameIndex = headers.indexOf("Track Name");
    const artistIndex = headers.indexOf("Artist Name(s)");
    const tracks = new Map<string, { name: string; artist: string }>();

    for (const [index, row] of rows.entries()) {
      const name = row[nameIndex]?.trim();
      const artist = row[artistIndex]?.trim();

      if (!name || !artist) {
        throw new Error(`CSV record ${index + 2} must have a track name and artist.`);
      }

      const key = JSON.stringify([name.toLowerCase(), artist.toLowerCase()]);
      if (!tracks.has(key)) {
        tracks.set(key, { name, artist });
      }
    }

    return tracks;
  } catch (error) {
    throw new Error(`${path}: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
}
