/** `..` path imported from `.ts` would broken the output dir structure */

import pkg from '../package.json';

const pkgInfo = [
  `%c${`Furegame ${pkg.version}`}%c`,
  `%c${pkg.author}%c`,
  '\n',
  `%c${pkg.license}%c`,
  `%c${pkg.homepage}%c`,
  '\n',
].join('');

const padding = 'padding: 0.2em 0.5em;';
const style = [
  ...[`background: #6cf; color: #fff; ${padding}`, ''],
  ...[`color: #6cc; ${padding}`, ''],
  ...[],
  ...[`background: #e00; color: #9ff; ${padding}`, ''],
  ...[`${padding}`, ''],
  ...[],
];

if (typeof window === 'undefined') console.info(pkgInfo.replace(/%c/g, ' * ')); // eslint-disable-line no-console
else console.info(pkgInfo, ...style); // eslint-disable-line no-console
