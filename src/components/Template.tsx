import { ReactNode, ReactElement } from 'react';
import { ToastContainer } from 'react-toastify';

import { Icon } from './Icon';
import { useSubtitleDataContext } from './SubtitleDataContext';
import { exportToCsv, getFollowedArtists } from 'helpers/data/actions';

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

        {viewType === 'login' ? (
          <p className="lead text-secondary">Export and sort your Spotify playlists.</p>
        ) : viewType === 'playlists' && playlistAmount !== 0 ? (
          <p className="lead text-secondary">
            {playlistAmount} playlists for {userId}
            {' ('}
            <span
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={0}
              className="download-artists"
              onClick={async () => {
                const artists = await getFollowedArtists();
                exportToCsv(artists, 'Followed_artists', 'artist');
              }}
            >
              export followed artists
            </span>
            {')'}
          </p>
        ) : null}

        <div id="subtitle" />
      </header>

      {children}

      <ToastContainer theme="dark" autoClose={3_000} limit={5} stacked position="bottom-right" />
    </div>
  );
}
