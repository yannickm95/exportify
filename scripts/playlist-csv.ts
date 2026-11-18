import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { parse } from "csv-parse/sync";

export function readPlaylistCsv(path: string, requiredHeaders: string[]) {
  const [headers, ...rows] = parse(readFileSync(resolve(process.env.INIT_CWD ?? process.cwd(), path), "utf8"), {
    bom: true,
    skip_empty_lines: true,
  });
  if (!headers) {
    throw new Error(`Expected columns: ${requiredHeaders.join(", ")}.`);
  }

  for (const header of requiredHeaders) {
    if (headers.filter((value) => value === header).length !== 1) {
      throw new Error(`Expected exactly one "${header}" column.`);
    }
  }

  return { headers, rows };
}
