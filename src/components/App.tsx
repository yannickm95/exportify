import { useLoginRedirect, useRouter } from 'helpers/router';
import { Error } from './Error';
import { Login } from './Login';
import { Logout } from './Logout';
import { PlaylistTable } from './PlaylistTable';
import { Template } from './Template';
import { useState } from 'react';
import { SubtitleDataContext } from './SubtitleDataContext';

export function App() {
  const { matchRoute } = useRouter();
  useLoginRedirect();

  const [subtitleData, setSubtitleData] = useState({ playlistAmount: 0, userId: '' });

  if (matchRoute('/spotify_error')) {
    return (
      <SubtitleDataContext value={{ viewType: 'error', setSubtitleData, ...subtitleData }}>
        <Template>
          <Error />
        </Template>
      </SubtitleDataContext>
    );
  }

  if (matchRoute('/playlists')) {
    return (
      <SubtitleDataContext value={{ viewType: 'playlists', setSubtitleData, ...subtitleData }}>
        <Template logoutElement={<Logout />}>
          <PlaylistTable />
        </Template>
      </SubtitleDataContext>
    );
  }

  return (
    <SubtitleDataContext value={{ viewType: 'login', setSubtitleData, ...subtitleData }}>
      <Template>
        <Login />
      </Template>
    </SubtitleDataContext>
  );
}
