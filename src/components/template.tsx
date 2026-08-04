import type { ReactNode, ReactElement } from "react";
import { toast, ToastContainer } from "react-toastify";

import { exportToCsv, getFollowedArtists } from "~/helpers/data/actions";

import { Icon } from "./icon";
import { useSubtitleDataContext } from "./subtitle-data-context";

export function Template({
  children,
  logoutElement = null,
}: {
  children: ReactNode;
  logoutElement?: ReactElement | null;
}) {
  const { viewType, playlistAmount, userId } = useSubtitleDataContext();

  return (
    <div className="min-h-screen bg-neutral-900 px-6 py-4 text-white xl:px-12">
      <div className="mx-auto w-full max-w-7xl">
        <header className="relative px-4 pt-8 pb-3 text-center">
          {logoutElement}

          <h1 className="flex items-center justify-center gap-2 text-2xl font-semibold sm:text-4xl">
            <Icon color="var(--color-green-500)" size="larger">
              exportify:spotify
            </Icon>
            <span className="wrap-break-word">Hatlaron&apos;s Exportify</span>
          </h1>

          {viewType === "login" ? (
            <p className="mt-2 text-xl font-light text-gray-400">Export and sort your Spotify playlists.</p>
          ) : playlistAmount !== 0 ? (
            <p className="mt-2 text-xl font-light text-gray-400">
              {playlistAmount} playlists for {userId}
              {" ("}
              <button
                type="button"
                className="cursor-pointer rounded-md p-1 text-white underline hover:bg-black hover:opacity-80 focus:bg-black focus:opacity-80 focus:outline-2 focus:outline-offset-2 focus:outline-green-500"
                onClick={() => {
                  getFollowedArtists()
                    .then((artists) => exportToCsv(artists, "Followed_artists", "artists"))
                    .catch(() => toast.error("Failed to export to CSV. Something went wrong, please try again!"));
                }}
              >
                export followed artists
              </button>
              {")"}
            </p>
          ) : null}

          <div id="subtitle" />
        </header>

        {children}
      </div>

      <ToastContainer theme="dark" autoClose={3_000} limit={5} stacked position="bottom-right" />
    </div>
  );
}
