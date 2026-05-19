import { SimplifiedAlbum as SpotifySimplifiedAlbums } from "@spotify/web-api-ts-sdk";

declare module "@spotify/web-api-ts-sdk" {
  interface SimplifiedAlbum extends SpotifySimplifiedAlbums {
    release_date: string | null;
    uri: string | null;
  }
}
