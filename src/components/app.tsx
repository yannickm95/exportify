import { useState } from "react";
import { Button } from "react-bootstrap";

import { useAuth } from "~/helpers/data/api";
import { useRouter } from "~/helpers/router";

import { Icon } from "./icon";
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
            <Button id="logoutButton" type="submit" variant="link" size="lg" onClick={logOut} title="Change user">
              <Icon size="large">logout</Icon>
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
