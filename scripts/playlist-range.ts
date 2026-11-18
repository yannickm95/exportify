import { readPlaylistCsv } from "./playlist-csv.ts";

const usage = `Usage:
  pnpm playlist-range <playlist.csv> report
  pnpm playlist-range <playlist.csv> filter <start-year>-<end-year>`;

interface PlaylistTrack {
  name: string;
  artist: string;
  year: number | null;
}

try {
  const args = process.argv.slice(2);
  if (args.length === 1 && (args[0] === "--help" || args[0] === "-h")) {
    console.log(usage);
    process.exit();
  }

  const [path, command, range] = args;
  if (
    path === undefined ||
    !((command === "report" && args.length === 2) || (command === "filter" && args.length === 3))
  ) {
    throw new Error(usage);
  }

  if (command === "report") {
    const tracks = readPlaylist(path);
    const counts = new Map<number, number>();
    let unknown = 0;
    for (const { year } of tracks) {
      if (year === null) unknown++;
      else counts.set(year, (counts.get(year) ?? 0) + 1);
    }

    for (const [year, count] of [...counts].sort(([first], [second]) => first - second)) {
      console.log(`${year}: ${count}`);
    }
    if (unknown > 0) console.log(`Unknown release year: ${unknown}`);
    if (tracks.length === 0) console.log("No tracks found.");
    console.log(`\nTotal tracks: ${tracks.length}`);
  } else {
    const match = range?.match(/^(\d{4})-(\d{4})$/);
    if (!match) {
      throw new Error("Expected a year range such as 1990-2000.");
    }
    const start = Number(match[1]);
    const end = Number(match[2]);
    if (start < 1 || start > end) {
      throw new Error("The start year must be at least 0001 and no later than the end year.");
    }

    const tracks = readPlaylist(path);
    const matches = tracks
      .filter(
        (track): track is PlaylistTrack & { year: number } =>
          track.year !== null && track.year >= start && track.year <= end,
      )
      .sort((first, second) => first.year - second.year);
    for (const { name, artist, year } of matches) {
      console.log(`${year} - ${artist} - ${name}`);
    }
    if (matches.length === 0) console.log("No tracks found in this range.");
    console.log(`\nMatching tracks: ${matches.length}`);

    const unknown = tracks.filter(({ year }) => year === null).length;
    if (unknown > 0) console.error(`Skipped ${unknown} tracks without a release year.`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

function readPlaylist(path: string): PlaylistTrack[] {
  try {
    const { headers, rows } = readPlaylistCsv(path, ["Track Name", "Artist Name(s)", "Album Release Date"]);
    const nameIndex = headers.indexOf("Track Name");
    const artistIndex = headers.indexOf("Artist Name(s)");
    const dateIndex = headers.indexOf("Album Release Date");

    return rows.map((row, index) => {
      const name = row[nameIndex]?.trim();
      const artist = row[artistIndex]?.trim();
      const date = row[dateIndex]?.trim();
      if (!name || !artist || date === undefined) {
        throw new Error(`CSV record ${index + 2} must have a track name, artist, and release date field.`);
      }

      if (date === "") return { name, artist, year: null };
      const match = date.match(/^(\d{4})(?:-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\d|3[01]))?)?$/);
      const year = Number(match?.[1]);
      const month = Number(match?.[2] ?? 1);
      const day = Number(match?.[3] ?? 1);
      if (!match || year < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate()) {
        throw new Error(`CSV record ${index + 2} has an invalid Album Release Date: "${date}".`);
      }

      return { name, artist, year };
    });
  } catch (error) {
    throw new Error(`${path}: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
}
