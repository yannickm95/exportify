import { getQueryParam, getSearchParam } from 'helpers/utils';

import Error from './Error';
import Login from './Login';
import Logout from './Logout';
import PlaylistTable from './PlaylistTable';
import Template from './Template';

export default function App() {
  const accessToken = getSearchParam('access_token');

  if (getQueryParam('spotify_error') !== '') {
    return (
      <Template>
        <Error />
      </Template>
    );
  }

  if (!accessToken) {
    return (
      <Template>
        <Login />
      </Template>
    );
  }

  return (
    <Template logoutElement={<Logout />}>
      <PlaylistTable />
    </Template>
  );
}
