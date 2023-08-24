import { useEffect, useState, useCallback } from 'react';
import { setAccessToken } from 'helpers/storage';

export function useRouter() {
  const [pathname, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const onLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', onLocationChange);

    return () => {
      window.removeEventListener('popstate', onLocationChange);
    };
  }, []);

  const matchRoute = useCallback(
    (path: string) => {
      return pathname.slice(0, -1).endsWith(path);
    },
    [pathname],
  );

  return { pathname, matchRoute };
}

export function useLoginRedirect() {
  const accessToken = new URLSearchParams(window.location.hash.substring(1)).get('access_token');

  useEffect(() => {
    if (accessToken) {
      setAccessToken(accessToken);
      navigate('/playlists');
    }
  }, [accessToken]);
}

export const navigate = (path: string) => {
  const baseLocation = `${window.location.origin}/exportify`;
  const formattedPath = path !== '/' ? `${path}/` : path;

  window.history.pushState({}, '', `${baseLocation}${formattedPath}`);

  const navEvent = new PopStateEvent('popstate');
  window.dispatchEvent(navEvent);
};
