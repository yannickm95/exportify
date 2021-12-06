import axios from 'axios';

import getPlaylisTracks from './helpers/getPlaylistTracks';
import formatCompareValue from './helpers/formatCompareValue';

export default async function lastSort(accessToken: string, playlist: any) {
  let tracks = await getPlaylisTracks(accessToken, playlist).then((data) =>
    data.map(({ track }) => formatCompareValue(track))
  );

  const newItems: any[] = [];

  for (let index = tracks.length - 1; index > 0; index--) {
    const item = tracks[index];

    if (
      tracks
        .slice(index - 100 > 0 ? index - 100 : 0, index)
        .some((prevItem) => item < prevItem)
    ) {
      newItems.push(item);
    } else {
      break;
    }
  }

  if (newItems.length === 0) return 0;

  for (const item of newItems) {
    const newIndex = tracks.findIndex((t) => t > item);

    await axios.put(
      `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
      {
        range_start: tracks.length - 1,
        insert_before: newIndex,
      },
      {
        headers: { Authorization: 'Bearer ' + accessToken },
      }
    );

    tracks = [
      ...tracks.slice(0, newIndex),
      item,
      ...tracks.slice(newIndex, -1),
    ];
  }

  return newItems.length;
}
