import axios from 'axios';
import Bottleneck from 'bottleneck';

const REQUEST_RETRY_BUFFER = 1000;
const MAX_RATE_LIMIT_RETRIES = 2;
const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 0,
});

export const apiCall = limiter.wrap(function (
  url: string,
  accessToken: string
) {
  return axios.get(url, {
    headers: { Authorization: 'Bearer ' + accessToken },
  });
});

export function apiCallErrorHandler(error: any) {
  if (error.isAxiosError) {
    if (error.request.status === 401) {
      // Return to home page after auth token expiry

      window.location.href = window.location.href.split('#')[0];
      return;
    } else if (error.request.status >= 500 && error.request.status < 600) {
      // Show error page when we get a 5XX that fails retries

      window.location.href = `${
        window.location.href.split('#')[0]
      }?spotify_error=true`;
      return;
    }
  }

  throw error;
}

limiter.on('failed', async (error, jobInfo) => {
  if (
    error.response.status === 429 &&
    jobInfo.retryCount < MAX_RATE_LIMIT_RETRIES
  ) {
    // Retry according to the indication from the server with a small buffer
    return (
      (error.response.headers['retry-after'] || 1) * 1000 + REQUEST_RETRY_BUFFER
    );
  } else if (
    error.response.status !== 401 &&
    error.response.status !== 429 &&
    jobInfo.retryCount === 0
  ) {
    // Log and retry any other failure once (e.g. 503/504 which sometimes occur)

    return REQUEST_RETRY_BUFFER;
  }
});
