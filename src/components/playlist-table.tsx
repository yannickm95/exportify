import type { SimplifiedPlaylist } from "@spotify/web-api-ts-sdk";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import { getPlaylists, getUser } from "~/helpers/data/actions";
import { createPlaylistTrackCache } from "~/helpers/data/playlist-track-cache";

import { PlaylistRow } from "./playlist-row";
import { useSubtitleDataContext } from "./subtitle-data-context";

export function PlaylistTable({ initializing }: { initializing: boolean }) {
  const [playlists, setPlaylists] = useState<SimplifiedPlaylist[]>();
  const [playlistTrackCache] = useState(createPlaylistTrackCache);

  const { setSubtitleData } = useSubtitleDataContext();

  useEffect(() => {
    (async function () {
      if (!initializing) {
        const user = await getUser();
        const playlists = await getPlaylists();

        setPlaylists(playlists);
        setSubtitleData({ playlistAmount: playlists.length, userId: user.display_name });
      }
    })().catch(() => toast.error("Failed to fetch playlists. Something went wrong, please reload the page!"));
  }, [setSubtitleData, initializing]);

  useEffect(() => {
    if (!playlists) return;

    playlistTrackCache.startPrefetch(playlists);

    return () => playlistTrackCache.dispose();
  }, [playlistTrackCache, playlists]);

  if (!playlists) {
    return (
      <div className="flex min-h-40 items-center justify-center" aria-label="Loading playlists">
        <span className="size-24 animate-spin rounded-full border-4 border-gray-200 border-t-gray-500" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-5xl border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="w-[5%] py-2" />
            <th className="w-[27.5%] py-2">Name</th>
            <th className="w-[7.5%] py-2">Tracks</th>
            <th className="w-[55%] py-2 text-right">
              <span className="text-[10px] font-normal">
                (* JS-sort will update &apos;date added&apos; to the time it was sorted, use with caution!)
              </span>{" "}
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {playlists.map((playlist, index) => (
            <PlaylistRow playlist={playlist} playlistTrackCache={playlistTrackCache} key={playlist.id} index={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
