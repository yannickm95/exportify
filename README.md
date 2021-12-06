## Usage

1. Create a dev app on https://developer.spotify.com/dashboard/
2. Enter your `client ID` you generated with the app in the input.
3. Grant `Exportify` access to view and edit your playlists
4. Click the `Export` button to export a playlist
5. Click the `Quick Sort` button to sort a playlist completely based on the quicksort algorithm (this takes a while)
6. Click the `Last Sort` button to sort items at the bottom of the playlist that have not been sorted yet.

### Export Format

Track data is exported in [CSV](http://en.wikipedia.org/wiki/Comma-separated_values) format with the following fields from the [Spotify track object](https://developer.spotify.com/documentation/web-api/reference/tracks/get-several-tracks/):

- Track URI
- Track Name
- Artist Name(s)
- Album Name
- Album Artist Name(s)
- Album Release Date
- Album Image URL (typically 640x640px jpeg)
- Disc Number
- Track Number
- Track Duration (ms)

## Development

This project was built with [Vite](https://vitejs.dev/).

In the project directory, first run `yarn install` to set up dependencies, then you can run:

**`yarn dev`**

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### Stack

In addition to [Vite](https://vitejs.dev/), the application is built using the following tools/libraries:

- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [Bootstrap 4](https://getbootstrap.com/) - styling and UI components
- [Font Awesome 5](https://fontawesome.com/) - vector icon set and toolkit

## Notes

Spotify does not associate with `Exportify`. Their business name, graphics, style guide, and other references are the trademarks of their respective copyright holders.

Thanks to @watsonbox's [original project](https://github.com/watsonbox/exportify) on which this hard-fork is derived.

This project uses the MIT License.
