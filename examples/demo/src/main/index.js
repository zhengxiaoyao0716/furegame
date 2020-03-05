import path from 'path';
import { Options, main, parseArgs } from '@fure/main';
import cores from './core/main';

const buildDir = path.join(__dirname, '../../build');
const manifest = require('../../build/manifest.json'); // eslint-disable-line @typescript-eslint/no-var-requires

const args = parseArgs(process.argv.slice(2), { dev: undefined, fullscreen: undefined, log: '.log/', mod: '.mod.js' }); // eslint-disable-line no-undef

const options: Options = {
  ...args.dev ? {
    page: 'http://localhost:3000',
  } : ({
    buildDir,
    buildPrefix: 'furegame',
    page: manifest['start_url'],
  }),
  ...{
    fullscreen: !!args.fullscreen,
    log: path.join(args.log, `${new Date().toISOString().slice(0, 10)}.log`),
    mod: args.mod,
    icon: path.join(buildDir, 'favicon.ico'),
    title: manifest.name,
  },
};
args.dev && console.log('launch with develop mode:', options); // eslint-disable-line no-console
main(cores, options);
