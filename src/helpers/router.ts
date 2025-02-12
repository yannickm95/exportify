import { useEffect, useState, useCallback } from 'react';

export function useRouter() {
  const [pathname, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const onLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', onLocationChange);
    window.addEventListener('load', onLocationChange);

    return () => {
      window.removeEventListener('popstate', onLocationChange);
      window.removeEventListener('load', onLocationChange);
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

export const navigate = (path: string) => {
  const baseLocation = `${window.location.origin}/exportify`;
  const formattedPath = path !== '/' ? `${path}/` : path;

  window.history.pushState({}, '', `${baseLocation}${formattedPath}`);

  const navEvent = new PopStateEvent('popstate');
  window.dispatchEvent(navEvent);
};
