import ttf from './app-icons-regular.ttf';
import woff from './app-icons-regular.woff';
import woff2 from './app-icons-regular.woff2';

export default function appIconsLoader() {
  return `@font-face {
    font-family: "App Icons";
    font-style: normal;
    font-weight: 400;
    src: url(${woff2}) format("woff2"),
         url(${woff}) format("woff"),
         url(${ttf}) format("truetype");
  }`;
}
