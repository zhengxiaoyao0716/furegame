import carlo from 'carlo';
import { Core, Events, Ticker } from '@fure/core';
import * as Pipes from './pipe';
import * as afs from './async-fs';

interface Options {
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
  }: Options,
): Promise<carlo.App> => {
  const app = await carlo.launch()
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
