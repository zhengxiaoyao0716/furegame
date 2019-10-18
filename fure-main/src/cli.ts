#!/usr/bin/env node

import { parseArgs } from './parseArgs';
import buildLaunch from './build-launch';

type ArgKeys = (
  // build:launch args
  | 'csc' | 'icon'
  | 'help' | 'h'
)
const args = parseArgs<ArgKeys>(process.argv.slice(2));

type Args = typeof args;
export interface Command {
  (args: Args): Promise<void>;
  desc: string;
}

const commands = {
  'build:launch': buildLaunch,
  help: (() => {
    const command: Command = async () => {
      Object.entries(commands).forEach(([name, { desc }]) => {
        console.info(`${name} ${desc}`); // eslint-disable-line no-console
      });
    };
    command.desc = '\n\tsee help';
    return command;
  })(),
};

const main = async (args: Args): Promise<void> => {
  const command = commands[args[0] as keyof typeof commands];
  if (command) {
    await command(args);
    return;
  }

  const help = args.help || args.h;
  if (help) {
    await commands.help(args);
    return;
  }

  console.info(`unknown command: ${args[0]}`); // eslint-disable-line no-console
};
main(args).catch(error => {
  console.error(error); // eslint-disable-line no-console
  process.exit(1);
});
