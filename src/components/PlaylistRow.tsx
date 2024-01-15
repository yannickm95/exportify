import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { exportToCsv, getPlaylistTracks, jsSort, lastSort, quickSortPlaylist } from 'helpers/data/actions';

import { ButtonLoader } from './ButtonLoader';
import { Icon } from './Icon';

export function PlaylistRow({ playlist, index }) {
  const [isJsSorting, setIsJsSorting] = useState(false);

  const sortPlaylistWithJS = () => {
    setIsJsSorting(true);

    getPlaylistTracks(playlist)
      .then((tracks) => jsSort(tracks, playlist.id))
      .then(successToast(playlist.name))
      .finally(() => setIsJsSorting(false));
  };

  const [isQuickSorting, setIsQuickSorting] = useState(false);

  const sortPlaylistWithQuick = () => {
    setIsQuickSorting(true);

    getPlaylistTracks(playlist)
      .then((tracks) => quickSortPlaylist(tracks, playlist.id))
      .then(successToast(playlist.name))
      .finally(() => setIsQuickSorting(false));
  };

  const [isLastSorting, setIsLastSorting] = useState(false);

  const sortPlaylistWithLast = () => {
    setIsLastSorting(true);

    getPlaylistTracks(playlist)
      .then((tracks) => lastSort(tracks, playlist.id))
      .then((sorted) =>
        toast.success(sorted ? `Sorted ${sorted} items of "${playlist.name}"!` : `"${playlist.name}" already sorted!`),
      )
      .finally(() => setIsLastSorting(false));
  };

  const [isExporting, setIsExporting] = useState(false);

  const exportPlaylist = () => {
    setIsExporting(true);

    getPlaylistTracks(playlist)
      .then((tracks) => exportToCsv(tracks, playlist.name, 'tracks'))
      .finally(() => setIsExporting(false));
  };

  const disabled = isExporting || isQuickSorting || isLastSorting || isJsSorting;

  if (playlist.uri == null) {
    return (
      <tr key={playlist.name} className={!isEven(index) ? 'alt-color' : ''}>
        <td>&nbsp;</td>
        <td>{playlist.name}</td>
        <td colSpan={2}>This playlist is not supported</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
    );
  }

  return (
    <tr key={playlist.uri} className={!isEven(index) ? 'alt-color' : ''}>
      <td>
        <img alt="cover" src={playlist?.images?.[0].url} />
      </td>
      <td className="align-middle">
        <a href={playlist.uri}>{playlist.name}</a>
      </td>
      <td className="align-middle">{playlist.tracks.total}</td>
      <td className="align-middle">
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            alignItems: 'center',
          }}
        >
          {showButton(playlist.name) ? (
            <Button
              type="submit"
              variant="primary"
              onClick={sortPlaylistWithJS}
              className="text-nowrap text-center"
              disabled={disabled}
            >
              {isJsSorting ? <ButtonLoader /> : 'JS*'}
            </Button>
          ) : null}

          {showButton(playlist.name) ? (
            <Button
              type="submit"
              variant="primary"
              onClick={sortPlaylistWithQuick}
              className="text-nowrap text-center button-flex"
              disabled={disabled}
            >
              {isQuickSorting ? <ButtonLoader /> : <Icon>sort_by_alpha</Icon>}
              Quicksort
            </Button>
          ) : null}

          {showButton(playlist.name) ? (
            <Button
              type="submit"
              variant="primary"
              onClick={sortPlaylistWithLast}
              className="text-nowrap text-center button-flex"
              disabled={disabled}
            >
              {isLastSorting ? <ButtonLoader /> : <Icon>sort</Icon>}
              Sort Last
            </Button>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            onClick={exportPlaylist}
            className="text-nowrap text-center button-flex"
            disabled={disabled}
          >
            {isExporting ? <ButtonLoader /> : <Icon>download</Icon>}
            Export
          </Button>
        </div>
      </td>
    </tr>
  );
}

function isEven(value: number) {
  if (value % 2 === 0) return true;
  else return false;
}

function showButton(playlistName: string) {
  const IGNORE_LIST = (import.meta.env.VITE_APP_PLAYLIST_IGNORE_LIST?.replaceAll('_', ' ').split(',') || []).map((l) =>
    l.toUpperCase(),
  );

  return !IGNORE_LIST.includes(playlistName.toUpperCase());
}

const successToast = (playlistName: string) => (sorted: string) => {
  return toast.success(
    sorted !== 'is-sorted' ? `Sorted all items of "${playlistName}"!` : `"${playlistName}" already sorted!`,
  );
};
