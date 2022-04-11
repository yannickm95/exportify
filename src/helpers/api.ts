import axios from 'axios';

export const apiCall = (url: string, accessToken: string) => {
  return axios.get(url, {
    headers: { Authorization: 'Bearer ' + accessToken },
  });
};

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
