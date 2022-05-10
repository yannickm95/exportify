/* global window */

import { getQueryParam, getSearchParam } from './utils';

export function login(clientId: string) {
  const changeUser = getQueryParam('change_user') !== '';

  window.location.href =
    'https://accounts.spotify.com/authorize' +
    '?client_id=' +
    clientId +
    '&redirect_uri=' +
    encodeURIComponent([window.location.protocol, '//', window.location.host, window.location.pathname].join('')) +
    '&scope=playlist-read-private%20playlist-read-collaborative%20user-library-read%20playlist-modify-private%20playlist-modify-public' +
    '&response_type=token' +
    '&show_dialog=' +
    changeUser;
}

export function logout() {
  window.location.href = `${window.location.href.split('#')[0]}?change_user=true`;
}

export async function apiCall(url: string, requestInit: RequestInit) {
  const response = await fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + getSearchParam('access_token'),
      'Content-Type': 'application/json',
    },
    ...requestInit,
  });

  if (!response.ok) {
    const baseLocation = window.location.href.split('#')[0];
    window.location.href = response.status === 401 ? baseLocation : `${baseLocation}?spotify_error=true`;
  }

  return await response.json();
}
