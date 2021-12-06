/* global document */

import { useState, useEffect } from 'react';

import fetchPlaylists from 'data/getPlaylists';
import { apiCall, apiCallErrorHandler } from 'helpers/api';

import PlaylistRow from './PlaylistRow';

export default function PlaylistTable({
  accessToken,
}: {
  accessToken: string;
}) {
  const [playlists, setPlaylists] = useState<any[] | undefined>(undefined);

  useEffect(() => {
    (async function () {
      try {
        const { data: user } = await apiCall(
          'https://api.spotify.com/v1/me',
          accessToken
        );
        const playlists = await fetchPlaylists(accessToken, user.id);
        const subtitleEl = document.getElementById('subtitle');

        setPlaylists(playlists);
        subtitleEl!.textContent = `${playlists.length} playlists for ${user.id}`;
      } catch (error) {
        apiCallErrorHandler(error);
      }
    })();
  }, [accessToken]);

  if (!playlists) {
    return <div className="spinner" />;
  }

  return (
    <div id="playlists">
      <table className="table table-hover table-sm">
        <thead>
          <tr>
            <th style={{ width: '100px' }} />
            <th>Name</th>
            <th>Tracks</th>
            <th style={{ width: '130px' }} />
            <th style={{ width: '130px' }} />
            <th
              style={{
                width: '130px',
                textAlign: 'right',
                paddingRight: '15px',
              }}
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {playlists.map((playlist, index) => (
            <PlaylistRow
              playlist={playlist}
              key={playlist.id}
              index={index}
              accessToken={accessToken}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
