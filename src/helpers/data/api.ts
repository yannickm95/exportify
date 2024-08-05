import { navigate } from 'helpers/router';
import { getAccessToken, setAccessToken } from 'helpers/storage';

export function login(clientId: string) {
  window.location.href =
    'https://accounts.spotify.com/authorize' +
    '?client_id=' +
    clientId +
    '&redirect_uri=' +
    encodeURIComponent([window.location.protocol, '//', window.location.host, window.location.pathname].join('')) +
    '&scope=playlist-read-private%20playlist-read-collaborative%20user-library-read%20playlist-modify-private%20playlist-modify-public%20user-follow-read' +
    '&response_type=token';
}

export function logout() {
  setAccessToken(undefined);
  navigate('/');
}

export async function apiCall(url: string, requestInit: RequestInit) {
  const response = await fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + getAccessToken(),
      'Content-Type': 'application/json',
    },
    ...requestInit,
  });

  if (!response.ok) {
    if (response.status === 401) {
      logout();
    } else {
      navigate('/spotify_error');
    }
  }

  return await response.json();
}
