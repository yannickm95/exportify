import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { useCallback, useEffect, useState } from "react";

import { navigate } from "~/helpers/router";

export let sdk: SpotifyApi;

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(false);

  const logIn = useCallback(async (clientId: string) => {
    try {
      localStorage.setItem("client_id", clientId);
      const redirectUrl = import.meta.env.VITE_APP_REDIRECT_URI || "http://localhost:9999/exportify/";
      const internalSdk = SpotifyApi.withUserAuthorization(clientId, redirectUrl, [
        "user-follow-read",
        "playlist-read-private",
        "playlist-read-collaborative",
        "playlist-modify-private",
        "playlist-modify-public",
      ]);

      const { authenticated } = await internalSdk.authenticate();

      if (authenticated) sdk = internalSdk;
      setAuthenticated(authenticated);
    } catch {}
  }, []);

  const logOut = useCallback(() => {
    // oxlint-disable-next-line typescript/no-unnecessary-condition
    sdk?.logOut();
    localStorage.removeItem("client_id");
    setAuthenticated(false);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(async () => {
      // oxlint-disable-next-line typescript/no-unnecessary-condition
      const { expires } = (await sdk?.getAccessToken()) || {};
      if (expires && expires < new Date().getTime()) logOut();
    }, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [logOut]);

  useEffect(() => {
    if (authenticated) {
      if (window.location.pathname === "/exportify/") navigate("/playlists");
    } else {
      const clientId = localStorage.getItem("client_id");

      if (clientId) {
        // oxlint-disable-next-line react-compiler/set-state-in-effect
        void logIn(clientId);
      } else {
        navigate("/");
      }
    }
  }, [authenticated, logIn]);

  return { authenticated, setAuthenticated, logOut, logIn };
}
