/* global window */

import { Button } from 'react-bootstrap';

import { getQueryParam } from 'helpers/utils';
import Icon from './Icon';

export default function Login() {
  return (
    <form
      className="login-container"
      onSubmit={(event) => {
        event.preventDefault();
        authorize(event);
      }}
    >
      <input
        id="clientId"
        required
        minLength={32}
        maxLength={32}
        type="password"
        placeholder="Enter client id..."
      />
      <Button
        type="submit"
        variant="outline-secondary"
        size="lg"
        className="flex"
      >
        <Icon>check_circle_outline</Icon>
        <span>Get Started</span>
      </Button>
    </form>
  );
}

function authorize(event: any) {
  const {
    clientId: { value: clientId },
  } = event.target.elements;

  const changeUser = getQueryParam('change_user') !== '';

  window.location.href =
    'https://accounts.spotify.com/authorize' +
    '?client_id=' +
    clientId +
    '&redirect_uri=' +
    encodeURIComponent(
      [
        window.location.protocol,
        '//',
        window.location.host,
        window.location.pathname,
      ].join('')
    ) +
    '&scope=playlist-read-private%20playlist-read-collaborative%20user-library-read%20playlist-modify-private%20playlist-modify-public' +
    '&response_type=token' +
    '&show_dialog=' +
    changeUser;
}
