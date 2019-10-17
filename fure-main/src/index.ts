import carlo from 'carlo';
import { Core, Events, Ticker } from '@fure/core';
import * as Pipes from './pipe';
import * as afs from './async-fs';

interface Options {
  buildDir?: string;
  buildPrefix?: string;
  fullscreen?: boolean;
  page?: string;
  log?: string;
  mod?: string;
}
export const main = async <E extends Events, M>(
  cores: Core<E, M>[],
  {
    buildDir = '',
    buildPrefix = '',
    fullscreen = false,
    log = `./log/${new Date().toISOString().slice(0, 10)}.log`,
    page = '/',
    mod = 'mod',
  }: Options,
): Promise<carlo.App> => {
  const app = await carlo.launch()
    .then(Pipes.pipeCore(Ticker.shared.core)) // pipe shared ticker
    .then(Pipes.pipeEach(cores.map(core => Pipes.pipeCore(core))))
    .then(Pipes.pipeBuild(buildDir, buildPrefix))
    .then(Pipes.pipeFullscreen(fullscreen))
    .then(Pipes.pipeStdLog(log))
    ;
  app.on('exit', () => process.exit());
  if (page != null) await Pipes.pipeLoad(page)(app);
  mod && await Pipes.pipeMod(mod)(app);
  return app;
};

export * from './parseArgs';
export { afs, Pipes };
