/* eslint no-console: 0 */

export function log(...args) {
  console.log(...args);
}

export function error(...args) {
  console.log(...args);
}

export function debug(...args) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args);
  }
}

export default {
  debug,
  error,
  log,
};