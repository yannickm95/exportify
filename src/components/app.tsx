import { useState } from "react";

import { useExpiryLogout, useLoginRedirect } from "~/helpers/data/api";
import { useRouter } from "~/helpers/router";

import { Error } from "./error";
import { Login } from "./login";
import { Logout } from "./logout";
import { PlaylistTable } from "./playlist-table";
import { SubtitleDataContext } from "./subtitle-data-context";
import { Template } from "./template";

export function App() {
  const { matchRoute } = useRouter();

  useLoginRedirect();
  useExpiryLogout();

  const [subtitleData, setSubtitleData] = useState({
    playlistAmount: 0,
    userId: "",
  });

  if (matchRoute("/spotify_error")) {
    return (
      <SubtitleDataContext value={{ viewType: "error", setSubtitleData, ...subtitleData }}>
        <Template>
          <Error />
        </Template>
      </SubtitleDataContext>
    );
  }

  if (matchRoute("/playlists")) {
    return (
      <SubtitleDataContext value={{ viewType: "playlists", setSubtitleData, ...subtitleData }}>
        <Template logoutElement={<Logout />}>
          <PlaylistTable />
        </Template>
      </SubtitleDataContext>
    );
  }

  return (
    <SubtitleDataContext value={{ viewType: "login", setSubtitleData, ...subtitleData }}>
      <Template>
        <Login />
      </Template>
    </SubtitleDataContext>
  );
}
