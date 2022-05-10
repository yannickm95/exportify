/* global document */

import { getPlaylists, getUser } from 'helpers/data';
import { useState, useEffect } from 'react';

import PlaylistRow from './PlaylistRow';

export default function PlaylistTable() {
  const [playlists, setPlaylists] = useState<any[] | undefined>();

  useEffect(() => {
    (async function () {
      const user = await getUser();
      const playlists = await getPlaylists(user.id);

      setPlaylists(playlists);

      const subtitleEl = document.getElementById('subtitle');
      subtitleEl!.textContent = `${playlists.length} playlists for ${user.id}`;
    })();
  }, []);

  if (!playlists) return <div className="spinner" />;

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
            <PlaylistRow playlist={playlist} key={playlist.id} index={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
