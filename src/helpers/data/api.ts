import { navigate } from 'helpers/router';
import { useEffect, useRef } from 'react';

/**
 * For more information, read
 * https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
 */

const redirectUrl = import.meta.env.VITE_APP_REDIRECT_URI || 'http://localhost:9999/exportify/';
const authorizationEndpoint = 'https://accounts.spotify.com/authorize';
const tokenEndpoint = 'https://accounts.spotify.com/api/token';
const scope = String.raw`
  user-follow-read
  playlist-read-private
  playlist-read-collaborative
  playlist-modify-private
  playlist-modify-public`;

// Data structure that manages the current active token, caching it in localStorage

const currentToken = {
  get access_token() {
    return localStorage.getItem('access_token') || null;
  },
  get refresh_token() {
    return localStorage.getItem('refresh_token') || null;
  },
  get expires_in() {
    return localStorage.getItem('refresh_in') || null;
  },
  get expires() {
    return localStorage.getItem('expires') || null;
  },

  save: function (response) {
    const { access_token, refresh_token, expires_in } = response;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('expires_in', expires_in);

    const now = new Date();
    const expiry = new Date(now.getTime() + expires_in * 1000);
    localStorage.setItem('expires', expiry.toString());
  },
};

// Effect handlers

export function useLoginRedirect() {
  // On page load, try to fetch auth code from current browser search URL
  const args = new URLSearchParams(window.location.search);
  const code = args.get('code');

  const effectRan = useRef(false);

  useEffect(() => {
    if (!effectRan.current) {
      // If we find a code, we're in a callback, do a token exchange
      if (code && !currentToken.access_token) {
        getToken(code).then((token) => {
          currentToken.save(token);

          if (token) navigate('/playlists');
        });
      } else if (currentToken.access_token) {
        navigate('/playlists');
      }

      localStorage.removeItem('code_verifier');
      localStorage.removeItem('client_id');

      effectRan.current = true;
    }
  }, [code]);
}

async function getToken(code: string) {
  const code_verifier = localStorage.getItem('code_verifier')!;
  const client_id = localStorage.getItem('client_id')!;

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUrl,
      code_verifier,
    }),
  });

  return await response.json();
}

export function useExpiryLogout() {
  const callback = () => {
    if (currentToken.expires && new Date(currentToken.expires).getTime() < new Date().getTime()) {
      logout();
    }
  };

  useEffect(() => {
    // Check every minute if the token has expired and if so log out.
    callback();
    const intervalId = window.setInterval(callback, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);
}

// Click handlers

export async function login(client_id: string) {
  window.localStorage.setItem('client_id', client_id);

  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomValues = crypto.getRandomValues(new Uint8Array(64));
  const randomString = randomValues.reduce((acc, x) => acc + possible[x % possible.length], '');

  const code_verifier = randomString;
  const data = new TextEncoder().encode(code_verifier);
  const hashed = await crypto.subtle.digest('SHA-256', data);

  const code_challenge_base64 = btoa(String.fromCharCode(...new Uint8Array(hashed)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  window.localStorage.setItem('code_verifier', code_verifier);

  const authUrl = new URL(authorizationEndpoint);
  const params = {
    response_type: 'code',
    client_id,
    scope,
    code_challenge_method: 'S256',
    code_challenge: code_challenge_base64,
    redirect_uri: redirectUrl,
  };

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString(); // Redirect the user to the authorization server for login
}

export function logout() {
  localStorage.clear();
  navigate('/');
}

// Spotify API Call

export async function apiCall(url: string, requestInit: RequestInit) {
  const response = await fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + currentToken.access_token,
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
