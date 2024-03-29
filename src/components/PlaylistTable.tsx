import { useState, useEffect } from 'react';

import { getPlaylists, getUser } from 'helpers/data/actions';

import { PlaylistRow } from './PlaylistRow';
import { useSubtitleDataContext } from './SubtitleDataContext';

export function PlaylistTable() {
  const [playlists, setPlaylists] = useState<any[] | undefined>();

  const { setSubtitleData } = useSubtitleDataContext();

  useEffect(() => {
    (async function () {
      const user = await getUser();
      const playlists = await getPlaylists(user.id);

      setPlaylists(playlists);
      setSubtitleData({ playlistAmount: playlists.length, userId: user.id });
    })();
  }, [setSubtitleData]);

  if (!playlists) return <div className="spinner" />;

  return (
    <div id="playlists">
      <table className="table table-hover table-sm">
        <thead>
          <tr>
            <th style={{ width: '5%' }} />
            <th style={{ width: '27.5%' }}>Name</th>
            <th style={{ width: '7.5%' }}>Tracks</th>
            <th
              style={{
                width: '55%',
                textAlign: 'right',
              }}
            >
              <span style={{ fontWeight: 400, fontSize: 10 }}>
                (* JS-sort will update &apos;date added&apos; to the time it was sorted, use with caution!)
              </span>{' '}
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
