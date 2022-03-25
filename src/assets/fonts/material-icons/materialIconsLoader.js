import ttf from './material-icons-regular.ttf';
import woff from './material-icons-regular.woff';
import woff2 from './material-icons-regular.woff2';

export default function materialIconsLoader() {
  return `@font-face {
    font-family: "Material Icons";
    font-style: normal;
    font-weight: 400;
    src: url(${woff2}) format("woff2"),
         url(${woff}) format("woff"),
         url(${ttf}) format("truetype");
  }`;
}
