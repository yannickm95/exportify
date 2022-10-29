import { exportToCsv, getPlaylistTracks, lastSort, quickSortPlaylist } from 'helpers/data';
import { isEven } from 'helpers/utils';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

import ButtonLoader from './ButtonLoader';
import Icon from './Icon';

export default function PlaylistRow({ playlist, index }) {
  const [isQuickSorting, setIsQuickSorting] = useState(false);

  const sortPlaylistWithQuick = () => {
    setIsQuickSorting(true);

    getPlaylistTracks(playlist)
      .then((tracks) => quickSortPlaylist(tracks, playlist.id))
      .then((sorted) =>
        toast.success(sorted !== 'is-sorted' ? `Sorted all items!` : 'Playlist already sorted!', {
          position: 'bottom-right',
          autoClose: 3_000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
        })
      )
      .finally(() => setIsQuickSorting(false));
  };

  const [isLastSorting, setIsLastSorting] = useState(false);

  const sortPlaylistWithLast = () => {
    setIsLastSorting(true);

    getPlaylistTracks(playlist)
      .then((tracks) => lastSort(tracks, playlist.id))
      .then((sorted) =>
        toast.success(sorted ? `Sorted ${sorted} items!` : 'Playlist already sorted!', {
          position: 'bottom-right',
          autoClose: 3_000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
        })
      )
      .finally(() => setIsLastSorting(false));
  };

  const [isExporting, setIsExporting] = useState(false);

  const exportPlaylist = () => {
    setIsExporting(true);

    getPlaylistTracks(playlist)
      .then((tracks) => exportToCsv(tracks, playlist.name))
      .finally(() => setIsExporting(false));
  };

  const disabled = isExporting || isQuickSorting || isLastSorting;

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
      <td className="text-center align-middle">
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
      </td>
      <td className="text-center align-middle">
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
      </td>
      <td className="text-center align-middle">
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
      </td>
    </tr>
  );
}

function showButton(playlistName: string) {
  const IGNORE_LIST = (import.meta.env.VITE_APP_PLAYLIST_IGNORE_LIST?.replaceAll('_', ' ').split(',') || []).map((l) =>
    l.toUpperCase()
  );

  return !IGNORE_LIST.includes(playlistName.toUpperCase());
}
