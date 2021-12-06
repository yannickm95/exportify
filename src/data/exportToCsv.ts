import { saveAs } from 'file-saver';

import { fileName } from 'helpers/utils';

import convertTracksToCsv from './helpers/convertTracksToCsv';
import getPlaylisTracks from './helpers/getPlaylistTracks';

export default async function exportToCsv(accessToken: string, playlist: any) {
  const items = await getPlaylisTracks(accessToken, playlist);

  const blob = new Blob([convertTracksToCsv(items)], {
    type: 'text/csv;charset=utf-8',
  });

  saveAs(blob, fileName(playlist.name));
}
