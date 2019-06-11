import path from 'path';
import { main } from '@fure/main';
import LogicDecoupling from './core/LogicDecoupling';

const parseArgs = (argv: string[]) => argv.reduce((args, arg, index) => {
  if (!arg.startsWith('-')) return args;
  const key = arg.slice(arg.startsWith('--') ? 2 : 1);
  const next = argv[index + 1] || '-end';
  if (next.startsWith('-')) return { ...args, [key]: true };
  return { ...args, [key]: next };
}, {});
const args: { dev?: boolean | 'true'; windowed?: boolean | 'true' } = parseArgs(process.argv); // eslint-disable-line no-undef

const options = args.dev ? {
  page: 'http://localhost:3000',
} : {
  buildDir: path.resolve(__dirname, '../../build'),
  buildPrefix: 'furegame',
  page: '/furegame',
};
args.dev && console.log('launch with develop mode:', options); // eslint-disable-line no-console
main([LogicDecoupling], options);
