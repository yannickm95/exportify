export default function formatCompareValue(track: any) {
  const trackNumber = track.track_number.toString().padStart(2, '0');
  const artist = sanitizeData(track.artists[0].name);
  const albumName = sanitizeData(track.album.name);
  const releaseDate =
    track.album.release_date === null ? '0000-00-00' : track.album.release_date;

  return artist + releaseDate + albumName + trackNumber;
}

function sanitizeData(value: string) {
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
