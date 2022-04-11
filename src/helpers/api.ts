/* global window */

import axios from 'axios';
import { getQueryParam } from './utils';

export function apiCall(url: string, accessToken: string) {
  return axios.get(url, {
    headers: { Authorization: 'Bearer ' + accessToken },
  });
}

export function apiCallErrorHandler(error: any) {
  if (error.request.status === 401) {
    // Return to home page after auth token expiry

    window.location.href = window.location.href.split('#')[0];
  } else {
    // Show error page when we get a 5XX that fails retries

    window.location.href = `${
      window.location.href.split('#')[0]
    }?spotify_error=true`;
  }
}

export function authorize(clientId: string) {
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

export function logout() {
  window.location.href = `${
    window.location.href.split('#')[0]
  }?change_user=true`;
}
