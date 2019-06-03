/** `..` path imported from `.ts` would broken the output dir structure */

import pkg from '../package.json';

const padding = 'padding: 0.2em 0.5em;';
console.info([ // eslint-disable-line no-console
  `%cFuregame ${pkg.version}%c`,
  `%c${pkg.author}%c\n`,
  `%c${pkg.license}%c`,
  `%c${pkg.homepage}%c`,
].join(''), ...[
  ...[`background: #6cf; color: #fff; ${padding}`, ''],
  ...[`color: #6cc; ${padding}`, ''],
  ...[`background: #e00; color: #9ff; ${padding}`, ''],
  ...[`${padding}`, ''],
]);
