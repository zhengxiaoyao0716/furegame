import path from 'path';
import fs from 'fs';
import util from 'util';
import carlo from 'carlo';
import { Subject } from 'rxjs';
import { Core, Events } from '@fure/core';

interface Pipe {
  (app: carlo.App): Promise<carlo.App>;
}

const fsReadFile = util.promisify(fs.readFile);
export const pipeBuild = (buildDir?: string, prefix?: string): Pipe => async app => {
  if (!buildDir) return app;

  app.serveFolder(buildDir, prefix);
  app.serveHandler(async request => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((request as any).resourceType() !== 'Document') {
      request.continue();
      return;
    }
    // redirect all pages to `index.html`.
    const headers = { 'content-type': 'text/html' };
    const body = await fsReadFile(path.join(buildDir, 'index.html'));
    request.fulfill({ status: 200, headers, body });
  });
  return app;
};

export const pipeCore = <E extends Events, M>(core: Core<E, M>): Pipe => async app => {
  await app.exposeFunction(core.rpcId, core.rpc);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subject = (core as any)[core.subjectId] as Subject<M>;
  const subcription = subject.subscribe(data => {
    const win = app.mainWindow();
    win && win.evaluate((data, subjectId) => {
      //#region THE BROWSER WINDOW CONTEXT
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = window as any; // eslint-disable-line no-undef
      return g[subjectId].next(data);
      //#endregion
    }, data as any, core.subjectId); // eslint-disable-line @typescript-eslint/no-explicit-any
  });
  app.on('exit', () => subcription.unsubscribe());
  return app;
};

export const pipeFullscreen = (fullscreen?: boolean): Pipe => async app => {
  const window = app.mainWindow();
  await app.exposeFunction('requestFullscreen', window.fullscreen.bind(window));
  fullscreen && window.fullscreen();
  return app;
};

export const pipeLoad = (...args: Parameters<carlo.App['load']>): Pipe => async app => {
  app.load(...args);
  return app;
};

export const pipeEach = (pipes: Pipe[]): Pipe => async app => {
  pipes.map(pipe => pipe(app));
  return app;
};

interface Options {
  buildDir?: string;
  buildPrefix?: string;
  fullscreen?: boolean;
  page?: string;
}
export const main = async <E extends Events, M>(
  cores: Core<E, M>[],
  {
    buildDir = '',
    buildPrefix = '',
    fullscreen = false,
    page = '/',
  }: Options,
): Promise<carlo.App> => {
  const app = await carlo.launch()
    .then(pipeEach(cores.map(core => pipeCore(core))))
    .then(pipeBuild(buildDir, buildPrefix))
    .then(pipeFullscreen(fullscreen))
    ;
  app.on('exit', () => process.exit());
  if (page != null) await pipeLoad(page)(app);
  return app;
};
