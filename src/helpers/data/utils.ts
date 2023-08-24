/* eslint-disable no-control-regex */

// ==========================
// SORTING
// ==========================

export function isArraySorted(array: any[]) {
  let sorted = true;

  for (let i = 0; i < array.length - 1; i++) {
    if (array[i] > array[i + 1]) {
      sorted = false;
      break;
    }
  }

  return sorted;
}

export function formatCompareValue(track: any) {
  const trackNumber = track.track_number.toString().padStart(2, '0');
  const artist = sanitizeTrack(track.artists[0].name);
  const albumName = sanitizeTrack(track.album.name);
  const releaseDate = track.album.release_date === null ? '0000-00-00' : track.album.release_date;

  return artist + releaseDate + albumName + trackNumber;
}

export function sanitizeTrack(value: string) {
  let returnValue = value;

  if (value.toLowerCase().startsWith('a ')) {
    returnValue = value.substring(2);
  } else if (value.toLowerCase().startsWith('the ')) {
    returnValue = value.substring(4);
  } else if (value.startsWith('$')) {
    returnValue = value.replace('$', 'S');
  }

  return returnValue.toLowerCase();
}

// ==========================
// FILE EXPORT
// ==========================

export function fileName(name: string) {
  return name.replace(/[\x00-\x1F\x7F/\\<>:;"|=,.?*[\] ]+/g, '_').toLowerCase() + '.csv';
}

export function convertTracksToCsv(tracks: any[]) {
  const formattedTracks = tracks
    .map(({ track }) => ({
      uri: track.uri,
      item: [
        track.uri.startsWith('spotify:local') ? decodeURIComponent(track.uri.replaceAll('+', ' ')) : track.uri,
        track.name,
        track.artists.map((a: any) => String(a.name).replace(/,/g, '\\,')).join(', '),
        track.album.name,
        track.album.artists.map((a: any) => String(a.name).replace(/,/g, '\\,')).join(', '),
        track.album.release_date == null ? '' : track.album.release_date,
        track.album.images[0] == null ? '' : track.album.images[0].url,
        track.album.uri == null ? '' : track.album.uri,
        track.disc_number,
        track.track_number,
        millisecondsToHuman(track.duration_ms),
      ],
    }))
    .filter((track) => track.uri)
    .map((track) => track.item);

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
    ...formattedTracks,
  ];

  return lines.map((line) => line.map(sanitizeLine).join(',') + '\n').join('');
}

export function sanitizeLine(value: string) {
  return '"' + String(value).replace(/"/g, '""') + '"';
}

export function millisecondsToHuman(ms: number) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor(ms / 1000 / 60);

  return minutes.toString() + ':' + seconds.toString().padStart(2, '0');
}
