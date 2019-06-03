import { main } from '@fure/main';
import core from './core';

const parseArgs = (argv: string[]) => argv.reduce((args, arg, index) => {
  if (!arg.startsWith('-')) return args;
  const key = arg.slice(arg.startsWith('--') ? 2 : 1);
  const next = argv[index + 1] || '-end';
  if (next.startsWith('-')) return { ...args, [key]: true };
  return { ...args, [key]: next };
}, {});
const args: { dev?: boolean | 'true'; windowed?: boolean | 'true' } = parseArgs(process.argv); // eslint-disable-line no-undef

const page = args.dev ? 'http://localhost:3000' : '/';
args.dev && console.log(`launch with develop mode, load: ${page}.`); // eslint-disable-line no-console

main(core, page);
