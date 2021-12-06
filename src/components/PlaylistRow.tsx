import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import quickSortPlaylist from 'data/quickSortPlaylist';
import lastSortPlaylist from 'data/lastSortPlaylist';
import exportToCsv from 'data/exportToCsv';
import { apiCallErrorHandler } from 'helpers/api';
import { isEven } from 'helpers/utils';

import ButtonLoader from './ButtonLoader';

const IGNORE_LIST =
  import.meta.env.VITE_APP_PLAYLIST_IGNORE_LIST?.replaceAll('_', ' ').split(
    ','
  ) || [];

export default function PlaylistRow({ playlist, accessToken, index }) {
  const [isQuickSorting, setIsQuickSorting] = useState(false);

  const sortPlaylistWithQuick = () => {
    setIsQuickSorting(true);

    quickSortPlaylist(accessToken, playlist)
      .then((sorted) =>
        toast.success(
          sorted !== 'is-sorted'
            ? `Sorted all items!`
            : 'Playlist already sorted!',
          {
            position: 'bottom-right',
            autoClose: 5_000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            progress: undefined,
          }
        )
      )
      .catch(apiCallErrorHandler)
      .finally(() => setIsQuickSorting(false));
  };

  const [isLastSorting, setIsLastSorting] = useState(false);

  const sortPlaylistWithLast = () => {
    setIsLastSorting(true);

    lastSortPlaylist(accessToken, playlist)
      .then((sorted) =>
        toast.success(
          sorted ? `Sorted ${sorted} items!` : 'Playlist already sorted!',
          {
            position: 'bottom-right',
            autoClose: 5_000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            progress: undefined,
          }
        )
      )
      .catch(apiCallErrorHandler)
      .finally(() => setIsLastSorting(false));
  };

  const [isExporting, setIsExporting] = useState(false);

  const exportPlaylist = () => {
    setIsExporting(true);

    exportToCsv(accessToken, playlist)
      .catch(apiCallErrorHandler)
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
        {!IGNORE_LIST.includes(playlist.name) ? (
          <Button
            type="submit"
            variant="primary"
            onClick={sortPlaylistWithQuick}
            className="text-nowrap text-center button-flex"
            disabled={disabled}
          >
            {isQuickSorting ? (
              <ButtonLoader />
            ) : (
              <FontAwesomeIcon icon={['fas', 'sort']} size="sm" />
            )}{' '}
            Quicksort
          </Button>
        ) : null}
      </td>
      <td className="text-center align-middle">
        {!IGNORE_LIST.includes(playlist.name) ? (
          <Button
            type="submit"
            variant="primary"
            onClick={sortPlaylistWithLast}
            className="text-nowrap text-center button-flex"
            disabled={disabled}
          >
            {isLastSorting ? (
              <ButtonLoader />
            ) : (
              <FontAwesomeIcon icon={['fas', 'sort-amount-up-alt']} size="sm" />
            )}{' '}
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
          {isExporting ? (
            <ButtonLoader />
          ) : (
            <FontAwesomeIcon icon={['fas', 'download']} size="sm" />
          )}{' '}
          Export
        </Button>
      </td>
    </tr>
  );
}
