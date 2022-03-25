/*global document*/

import appIconsLoader from './fonts/app-icons/appIconsLoader';
import materialIconsLoader from './fonts/material-icons/materialIconsLoader';

const createStyleTag = () => {
  const style = document.createElement('style');
  style.rel = 'stylesheet';
  style.type = 'text/css';
  return style;
};

export default function fontLoader() {
  const styleTag = createStyleTag();
  const fonts = [materialIconsLoader(), appIconsLoader()].join('\n');
  const allFonts = document.createTextNode(fonts);
  styleTag.appendChild(allFonts);

  document.head.appendChild(styleTag);
}
