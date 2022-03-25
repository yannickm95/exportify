import { ReactNode, ReactElement } from 'react';
import { ToastContainer } from 'react-toastify';
import Icon from './Icon';

export default function Template({
  children,
  logoutElement = null,
}: {
  children: ReactNode;
  logoutElement?: ReactElement | null;
}) {
  return (
    <div className="App container">
      <header className="App-header">
        {logoutElement}

        <h1 className="flex">
          <Icon color="#1ed760" size="larger">
            app:spotify
          </Icon>
          <span>Hatlaron&apos;s Exportify</span>
        </h1>

        <p id="subtitle" className="lead text-secondary">
          Export and sort your Spotify playlists.
        </p>
      </header>

      {children}

      <ToastContainer theme="dark" />
    </div>
  );
}
