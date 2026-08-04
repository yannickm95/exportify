import { useState } from "react";
import { Route, Routes } from "react-router";

import { useAuth } from "~/helpers/data/api";

import { Button } from "./button";
import { LogoutIcon } from "./icon";
import { Login } from "./login";
import { PlaylistTable } from "./playlist-table";
import { SubtitleDataContext } from "./subtitle-data-context";
import { Template } from "./template";

export function App() {
  const { authenticated, logIn, logOut } = useAuth();

  const [subtitleData, setSubtitleData] = useState({ playlistAmount: 0, userId: "" });

  return (
    <Routes>
      <Route
        path="/playlists"
        element={
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
        }
      />
      <Route
        path="*"
        element={
          <SubtitleDataContext value={{ viewType: "login", setSubtitleData, ...subtitleData }}>
            <Template>
              <Login logIn={logIn} />
            </Template>
          </SubtitleDataContext>
        }
      />
    </Routes>
  );
}
