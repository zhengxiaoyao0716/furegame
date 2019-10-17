import fs from 'fs';
import path from 'path';
import carlo from 'carlo';
import { Subject } from 'rxjs';
import { Core, Events } from '@fure/core';
import * as afs from './../async-fs';

export interface Pipe {
  (app: carlo.App): Promise<carlo.App>;
}

export const pipeEach = (pipes: Pipe[]): Pipe => async app => {
  pipes.map(pipe => pipe(app));
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
    const body = await afs.readFile(path.join(buildDir, 'index.html'));
    request.fulfill({ status: 200, headers, body });
  });
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

export const pipeStdLog = (logPath: string, outs = [process.stdout, process.stderr]): Pipe => async app => {
  const file = path.resolve(process.cwd(), logPath);
  console.info(`see "${file}" for the log.\n`); // eslint-disable-line no-console

  if (!await afs.exists(file)) await afs.mkdir(path.dirname(file), { recursive: true });
  const log = fs.createWriteStream(file, { flags: 'a', encoding: 'UTF-8' });
  log.write(`//region ${new Date().toISOString()}\n\n`);

  outs.forEach(out => {
    const write = out.write.bind(out);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (out.write as any) = (...args: Parameters<typeof log.write>) => {
      write(...args);
      return log.write(...args);
    };
  });

  app.on('exit', () => {
    log.write(`\n//endregion ${new Date().toISOString()}\n\n\n`);
    log.end();
  });
  return app;
};

export * from './mod';
