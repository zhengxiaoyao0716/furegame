import path from 'path';
import carlo from 'carlo';
import { Core, Events, Ticker } from '@fure/core';
import * as Pipes from './pipe';
import * as afs from './async-fs';

export const optimizeUserDataDir = (options: carlo.LaunchOptions): carlo.LaunchOptions => {
  if (!(process as any).pkg) return options; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (options.userDataDir && path.isAbsolute(options.userDataDir)) return options;
  // packed by `pkg`, avoid to create snapshot path in really file system.
  const userDataDir = path.join(path.dirname(process.execPath), options.userDataDir || '.profile');
  return { ...options, userDataDir };
};

export interface Options extends carlo.LaunchOptions {
  buildDir?: string;
  buildPrefix?: string;
  fullscreen?: boolean;
  log?: string;
  mod?: string;
  page?: string;
}
export const main = async <E extends Events, M>(
  cores: Core<E, M>[],
  {
    buildDir = '',
    buildPrefix = '',
    fullscreen = false,
    log = `./log/${new Date().toISOString().slice(0, 10)}.log`,
    mod = 'mod',
    page = '/',
    ...launchOptions
  }: Options,
): Promise<carlo.App> => {
  const app = await carlo.launch(optimizeUserDataDir(launchOptions))
    .then(Pipes.pipeCore(Core.main))          // pipe shared core
    .then(Pipes.pipeCore(Ticker.shared.core)) // pipe shared ticker
    .then(Pipes.pipeEach(cores.map(core => Pipes.pipeCore(core))))
    .then(Pipes.pipeBuild(buildDir, buildPrefix))
    .then(Pipes.pipeFullscreen(fullscreen))
    .then(Pipes.pipeStdLog(log))
    .then(Pipes.pipeMod(mod))
    .then(Pipes.pipeExit())
    ;
  page != null && await app.load(page);
  return app;
};

export * from './parseArgs';
export { afs, Pipes };
