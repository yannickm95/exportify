import { getQueryParam } from 'helpers/utils';

import Error from './Error';
import Login from './Login';
import Logout from './Logout';
import PlaylistTable from './PlaylistTable';
import Template from './Template';

export default function App() {
  const key = new URLSearchParams(window.location.hash.substring(1));

  if (getQueryParam('spotify_error') !== '') {
    return (
      <Template>
        <Error />
      </Template>
    );
  }

  if (!key.has('access_token')) {
    return (
      <Template>
        <Login />
      </Template>
    );
  }

  return (
    <Template logoutElement={<Logout />}>
      <PlaylistTable accessToken={key.get('access_token')!} />
    </Template>
  );
}
