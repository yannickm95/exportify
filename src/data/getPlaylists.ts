import { apiCall } from 'helpers/api';

const PLAYLIST_LIMIT = 20;

export default async function getPlaylists(accessToken: string, userId: string) {
  const loadSlice = async (start: number, end: number) => {
    const playlistsUrl = `https://api.spotify.com/v1/users/${userId}/playlists?offset=${start}&limit=${end - start}`;
    const playlistsResponse = await apiCall(playlistsUrl, accessToken);

    return playlistsResponse.data;
  };

  const { items, total } = await loadSlice(0, PLAYLIST_LIMIT);
  let playlists = items;

  for (let offset = PLAYLIST_LIMIT; offset < total; offset = offset + PLAYLIST_LIMIT) {
    const { items } = await loadSlice(offset, offset + PLAYLIST_LIMIT);
    playlists = [...playlists, ...items];
  }

  return playlists;
}
