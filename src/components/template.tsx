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
    <div className="App container">
      <header className="App-header">
        {logoutElement}

        <h1 className="flex">
          <Icon color="#1ed760" size="larger">
            exportify:spotify
          </Icon>
          <span>Hatlaron&apos;s Exportify</span>
        </h1>

        {viewType === "login" ? (
          <p className="lead text-secondary">Export and sort your Spotify playlists.</p>
        ) : playlistAmount !== 0 ? (
          <p className="lead text-secondary">
            {playlistAmount} playlists for {userId}
            {" ("}
            {/* oxlint-disable-next-line jsx_a11y/click-events-have-key-events,jsx_a11y/no-static-element-interactions */}
            <span
              tabIndex={0}
              className="download-artists"
              onClick={() => {
                getFollowedArtists()
                  .then((artists) => exportToCsv(artists, "Followed_artists", "artists"))
                  .catch(() => toast.error("Failed to export to CSV. Something went wrong, please try again!"));
              }}
            >
              export followed artists
            </span>
            {")"}
          </p>
        ) : null}

        <div id="subtitle" />
      </header>

      {children}

      <ToastContainer theme="dark" autoClose={3_000} limit={5} stacked position="bottom-right" />
    </div>
  );
}
