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
  (args: Args): void | Promise<void>;
  desc: string;
}

const commands = {
  'build:launch': buildLaunch,
  help: (() => {
    const command: Command = () => {
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
    command(args);
    return;
  }

  const help = args.help || args.h;
  if (help) {
    commands.help(args);
    return;
  }

  console.info(`unknown command: ${args[0]}`); // eslint-disable-line no-console
};
main(args);
