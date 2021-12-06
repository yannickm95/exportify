import { millisecondsToHuman, sanitize } from 'helpers/utils';

export default function convertTracksToCsv(tracks: any[]) {
  const lines = [
    [
      'Track URI',
      'Track Name',
      'Artist Name(s)',
      'Album Name',
      'Album Artist Name(s)',
      'Album Release Date',
      'Album Image URL',
      'Album URI',
      'Disc Number',
      'Track Number',
      'Track Duration (ms)',
    ],
    ...formatTracksForCsv(tracks)
      .filter((track) => track.uri)
      .map((track) => track.item),
  ];

  return lines.map((line) => line.map(sanitize).join(',') + '\n').join('');
}

function formatTracksForCsv(items: any[]) {
  return items.map(({ track }) => ({
    uri: track.uri,
    item: [
      track.uri.startsWith('spotify:local')
        ? decodeURIComponent(track.uri.replaceAll('+', ' '))
        : track.uri,
      track.name,
      track.artists
        .map((a: any) => String(a.name).replace(/,/g, '\\,'))
        .join(', '),
      track.album.name,
      track.album.artists
        .map((a: any) => String(a.name).replace(/,/g, '\\,'))
        .join(', '),
      track.album.release_date == null ? '' : track.album.release_date,
      track.album.images[0] == null ? '' : track.album.images[0].url,
      track.album.uri == null ? '' : track.album.uri,
      track.disc_number,
      track.track_number,
      millisecondsToHuman(track.duration_ms),
    ],
  }));
}
