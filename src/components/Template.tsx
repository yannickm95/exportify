import { ReactNode, ReactElement } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ToastContainer } from 'react-toastify';

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

        <h1>
          <FontAwesomeIcon
            icon={['fab', 'spotify']}
            color="#1ed760"
            size="sm"
          />{' '}
          Hatlaron&apos;s Exportify
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
