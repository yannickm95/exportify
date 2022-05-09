import Icon from './Icon';

export default function Error() {
  return (
    <div id="spotifyErrorMessage" className="lead">
      <p>
        <Icon size="larger" style={{ marginBottom: '20px' }}>
          bolt
        </Icon>
      </p>

      <p>
        Oops, Exportify has encountered an unexpected error (5XX) while using the Spotify API. This kind of error is due
        to a problem on Spotify&apos;s side, and although it&apos;s rare, unfortunately all we can do is retry later.
      </p>

      <p style={{ marginTop: '50px' }}>
        Keep an eye on the{' '}
        <a target="_blank" rel="noreferrer" href="https://status.spotify.dev/">
          Spotify Web API Status page
        </a>{' '}
        to see if there are any known problems right now, and then{' '}
        <a rel="noreferrer" href="?">
          retry
        </a>
        .
      </p>
    </div>
  );
}
