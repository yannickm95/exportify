import axios from 'axios';

import { isArraySorted } from 'helpers/utils';

import getPlaylisTracks from './helpers/getPlaylistTracks';
import formatCompareValue from './helpers/formatCompareValue';

export default async function quickSortPlaylist(
  accessToken: string,
  playlist: any
) {
  async function quickSort(arrayToSort: any[], low: number, high: number) {
    const instanceArray = [...arrayToSort];
    const index = await partition(instanceArray, low, high);

    if (low < index - 1) {
      await quickSort(instanceArray, low, index - 1);
    }
    if (index < high) {
      await quickSort(instanceArray, index, high);
    }
  }

  async function partition(arrayToSort: any[], low: number, high: number) {
    const pivot = arrayToSort[Math.floor((low + high) / 2)];

    while (low <= high) {
      while (arrayToSort[low] < pivot) {
        low++;
      }
      while (arrayToSort[high] > pivot) {
        high--;
      }

      if (low <= high) {
        await swap(arrayToSort, low, high);
        low++;
        high--;
      }
    }
    return low;
  }

  async function swap(arrayToSort: any[], low: number, high: number) {
    const lowValue = arrayToSort[low];
    arrayToSort[low] = arrayToSort[high];
    arrayToSort[high] = lowValue;

    await axios.put(
      `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
      {
        range_start: low,
        insert_before: high + 1,
      },
      {
        headers: { Authorization: 'Bearer ' + accessToken },
      }
    );
    await axios.put(
      `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
      {
        range_start: high - 1 > 0 ? high - 1 : 0,
        insert_before: low,
      },
      {
        headers: { Authorization: 'Bearer ' + accessToken },
      }
    );
  }

  const tracks = await getPlaylisTracks(accessToken, playlist).then((data) =>
    data.map(({ track }) => formatCompareValue(track))
  );

  if (!isArraySorted(tracks)) {
    await quickSort(tracks, 0, tracks.length - 1);
    return 'sorted';
  } else {
    return 'is-sorted';
  }
}
