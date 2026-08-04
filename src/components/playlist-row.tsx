import type { SimplifiedPlaylist } from "@spotify/web-api-ts-sdk";
import { useState } from "react";
import { toast } from "react-toastify";

import { cn } from "~/helpers/cn";
import { exportToCsv, getPlaylistTracks, jsSort, lastSort, quickSortPlaylist } from "~/helpers/data/actions";

import { Button } from "./button";
import { ButtonLoader } from "./button-loader";
import { Icon } from "./icon";

export function PlaylistRow({ playlist, index }: { playlist: SimplifiedPlaylist; index: number }) {
  const [isJsSorting, setIsJsSorting] = useState(false);

  const sortPlaylistWithJS = () => {
    setIsJsSorting(true);

    getPlaylistTracks(playlist)
      .then((tracks) => jsSort(tracks, playlist.id))
      .then(successToast(playlist.name))
      .catch(() => errorToast(playlist.name))
      .finally(() => setIsJsSorting(false));
  };

  const [isQuickSorting, setIsQuickSorting] = useState(false);

  const sortPlaylistWithQuick = () => {
    setIsQuickSorting(true);

    getPlaylistTracks(playlist)
      .then((tracks) => quickSortPlaylist(tracks, playlist.id))
      .then(successToast(playlist.name))
      .catch(() => errorToast(playlist.name))
      .finally(() => setIsQuickSorting(false));
  };

  const [isLastSorting, setIsLastSorting] = useState(false);

  const sortPlaylistWithLast = () => {
    setIsLastSorting(true);

    getPlaylistTracks(playlist)
      .then((tracks) => lastSort(tracks, playlist.id))
      .then(successToast(playlist.name))
      .catch(() => errorToast(playlist.name))
      .finally(() => setIsLastSorting(false));
  };

  const [isExporting, setIsExporting] = useState(false);

  const exportPlaylist = () => {
    setIsExporting(true);

    getPlaylistTracks(playlist)
      .then((tracks) => exportToCsv(tracks, playlist.name, "tracks"))
      .catch(() => toast.error("Failed to export to CSV. Something went wrong, please try again!"))
      .finally(() => setIsExporting(false));
  };

  const disabled = isExporting || isQuickSorting || isLastSorting || isJsSorting;

  return (
    <tr
      key={playlist.uri}
      className={cn("border-b border-gray-300 px-2 hover:bg-neutral-950", !isEven(index) && "bg-neutral-800")}
    >
      <td className="p-2.5">
        <div className="mr-6 size-20 min-w-20 overflow-hidden rounded-md">
          <img className="size-full object-cover" alt="cover" src={playlist.images[0]?.url} />
        </div>
      </td>
      <td>
        <a className="text-blue-300 underline hover:text-blue-500" href={playlist.uri}>
          {playlist.name}
        </a>
      </td>
      <td>{playlist.tracks?.total ?? 0}</td>
      <td className="p-2.5">
        <div className="flex items-center justify-end gap-2.5">
          {showButton(playlist.name) ? (
            <Button
              type="button"
              onClick={sortPlaylistWithJS}
              className="text-center whitespace-nowrap"
              disabled={disabled}
            >
              {isJsSorting ? <ButtonLoader /> : "JS*"}
            </Button>
          ) : null}

          {showButton(playlist.name) ? (
            <Button
              type="button"
              onClick={sortPlaylistWithQuick}
              className="w-30 text-center whitespace-nowrap"
              disabled={disabled}
            >
              {isQuickSorting ? <ButtonLoader /> : <Icon>sort_by_alpha</Icon>}
              Quicksort
            </Button>
          ) : null}

          {showButton(playlist.name) ? (
            <Button
              type="button"
              onClick={sortPlaylistWithLast}
              className="w-30 text-center whitespace-nowrap"
              disabled={disabled}
            >
              {isLastSorting ? <ButtonLoader /> : <Icon>sort</Icon>}
              Sort Last
            </Button>
          ) : null}

          <Button
            type="button"
            onClick={exportPlaylist}
            className="w-30 text-center whitespace-nowrap"
            disabled={disabled}
          >
            {isExporting ? <ButtonLoader /> : <Icon>download</Icon>}
            Export
          </Button>
        </div>
      </td>
    </tr>
  );
}

function isEven(value: number) {
  if (value % 2 === 0) return true;
  else return false;
}

function showButton(playlistName: string) {
  const IGNORE_LIST = (import.meta.env.VITE_APP_PLAYLIST_IGNORE_LIST?.replaceAll("_", " ").split(",") || []).map((l) =>
    l.toUpperCase(),
  );

  return !IGNORE_LIST.includes(playlistName.toUpperCase());
}

const successToast = (playlistName: string) => (sorted: "sorted" | "is-sorted" | number) => {
  let successText = `${playlistName} already sorted!`;
  if (sorted === "sorted") successText = `Sorted all items of ${playlistName}!`;
  if (typeof sorted === "number" && sorted > 0) successText = `Sorted ${sorted} items of ${playlistName}!`;

  return toast.success(successText);
};

const errorToast = (playlistName: string) => {
  return toast.error(`Failed to sort ${playlistName}. Something went wrong, please try again!`);
};
