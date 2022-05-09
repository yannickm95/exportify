/* eslint-disable no-control-regex */

export const fileName = (name: string) =>
  name.replace(/[\x00-\x1F\x7F/\\<>:;"|=,.?*[\] ]+/g, '_').toLowerCase() + '.csv';

export function getQueryParam(name: string) {
  name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
    results = regex.exec(window.location.search);

  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

export function getSearchParam(value: string) {
  const key = new URLSearchParams(window.location.hash.substring(1));

  return key.get(value);
}

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

export function isEven(value: number) {
  if (value % 2 === 0) return true;
  else return false;
}

export function millisecondsToHuman(ms: number) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor(ms / 1000 / 60);

  return minutes.toString() + ':' + seconds.toString().padStart(2, '0');
}

export function sanitize(string: string) {
  return '"' + String(string).replace(/"/g, '""') + '"';
}
