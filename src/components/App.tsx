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
      <SubtitleDataContext.Provider value={{ viewType: 'error', setSubtitleData, ...subtitleData }}>
        <Template>
          <Error />
        </Template>
      </SubtitleDataContext.Provider>
    );
  }

  if (matchRoute('/playlists')) {
    return (
      <SubtitleDataContext.Provider value={{ viewType: 'playlists', setSubtitleData, ...subtitleData }}>
        <Template logoutElement={<Logout />}>
          <PlaylistTable />
        </Template>
      </SubtitleDataContext.Provider>
    );
  }

  return (
    <SubtitleDataContext.Provider value={{ viewType: 'login', setSubtitleData, ...subtitleData }}>
      <Template>
        <Login />
      </Template>
    </SubtitleDataContext.Provider>
  );
}
