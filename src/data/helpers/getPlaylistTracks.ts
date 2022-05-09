import { apiCall } from 'helpers/api';

export default async function getPlaylistTracks(accessToken: string, playlist: any) {
  const requests: string[] = [];
  const limit = playlist.tracks.limit || 100;

  for (let offset = 0; offset < playlist.tracks.total; offset = offset + limit) {
    requests.push(`${playlist.tracks.href.split('?')[0]}?offset=${offset}&limit=${limit}`);
  }

  const trackPromises = requests.map((request) => {
    return apiCall(request, accessToken);
  });
  const trackResponses = await Promise.all(trackPromises);

  return trackResponses.flatMap((response) => {
    return response.data.items.filter((i: any) => i.track); // Exclude null track attributes
  });
}
