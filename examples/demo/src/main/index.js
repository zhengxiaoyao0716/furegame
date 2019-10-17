import path from 'path';
import { main, parseArgs } from '@fure/main';
import LogicDecoupling from './core/LogicDecoupling';

const args = parseArgs(process.argv.slice(2), { dev: undefined, fullscreen: undefined }); // eslint-disable-line no-undef

const options = args.dev ? {
  page: 'http://localhost:3000',
} : {
  buildDir: path.join(__dirname, '../../build'),
  buildPrefix: 'furegame',
  page: '/furegame',
  fullscreen: !!args.fullscreen,
};
args.dev && console.log('launch with develop mode:', options); // eslint-disable-line no-console
main([LogicDecoupling], options);
