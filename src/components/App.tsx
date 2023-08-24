import { useLoginRedirect, useRouter } from 'helpers/router';
import { Error } from './Error';
import { Login } from './Login';
import { Logout } from './Logout';
import { PlaylistTable } from './PlaylistTable';
import { Template } from './Template';

export function App() {
  const { matchRoute } = useRouter();
  useLoginRedirect();

  if (matchRoute('spotify_error')) {
    return (
      <Template>
        <Error />
      </Template>
    );
  }

  if (matchRoute('playlists')) {
    return (
      <Template logoutElement={<Logout />}>
        <PlaylistTable />
      </Template>
    );
  }

  return (
    <Template>
      <Login />
    </Template>
  );
}
