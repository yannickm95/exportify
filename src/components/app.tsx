import { useState } from "react";

import { useAuth } from "~/helpers/data/api";
import { useRouter } from "~/helpers/router";

import { Button } from "./button";
import { LogoutIcon } from "./icon";
import { Login } from "./login";
import { PlaylistTable } from "./playlist-table";
import { SubtitleDataContext } from "./subtitle-data-context";
import { Template } from "./template";

export function App() {
  const { authenticated, logIn, logOut } = useAuth();
  const { matchRoute } = useRouter();

  const [subtitleData, setSubtitleData] = useState({ playlistAmount: 0, userId: "" });

  if (matchRoute("/playlists")) {
    return (
      <SubtitleDataContext value={{ viewType: "playlists", setSubtitleData, ...subtitleData }}>
        <Template
          logoutElement={
            <Button
              type="button"
              variant="link"
              size="large"
              className="absolute top-0 right-0 h-auto p-5 sm:p-10"
              onClick={logOut}
              title="Change user"
            >
              <LogoutIcon size="large" />
            </Button>
          }
        >
          <PlaylistTable initializing={!authenticated} />
        </Template>
      </SubtitleDataContext>
    );
  }

  return (
    <SubtitleDataContext value={{ viewType: "login", setSubtitleData, ...subtitleData }}>
      <Template>
        <Login logIn={logIn} />
      </Template>
    </SubtitleDataContext>
  );
}
