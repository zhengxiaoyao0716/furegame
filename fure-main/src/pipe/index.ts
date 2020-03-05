import fs from 'fs';
import path from 'path';
import carlo from 'carlo';
import { Core } from '@fure/core';
import * as afs from './../async-fs';

export interface Pipe {
  (app: carlo.App): Promise<carlo.App>;
}

export const pipeEach = (pipes: Pipe[]): Pipe => async app => {
  pipes.map(pipe => pipe(app));
  return app;
};

export const pipeCore = <M>(newCore: (app: carlo.App) => Core<M>): Pipe => async app => {
  const core = newCore(app);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await app.exposeFunction(core.rpcId, (core as any)[core.rpcId]);
  const subcription = core.pipe().subscribe(data => {
    const win = app.mainWindow();
    win && win.evaluate((data, msgId) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = window as any; // eslint-disable-line no-undef
      return g[msgId](data);
    }, data as any, core.msgId); // eslint-disable-line @typescript-eslint/no-explicit-any
  });
  app.on('exit', () => subcription.unsubscribe());
  return app;
};

export const pipeBuild = (buildDir?: string, prefix?: string): Pipe => async app => {
  // f**k the carlo.
  const handlers = [] as Array<(request: carlo.HttpRequest) => Promise<boolean>>;
  const serveHandler = app.serveHandler.bind(app);
  app.serveHandler = ((handler: (request: carlo.HttpRequest) => Promise<boolean>) => handlers.push(handler)) as unknown as typeof serveHandler;
  serveHandler(async request => {
    for (let index = handlers.length - 1; index >= 0; index--) {
      const handler = handlers[index];
      const finish = await handler(request);
      if (finish === true) return;
      else if (finish === false) continue;
      throw new Error('the handler of "app.serverHandler" must return "true" or "false".');
    }
    request.continue();
  });

  if (!buildDir) return app;

  app.serveFolder(buildDir, prefix);

  app.serveHandler(async request => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((request as any).resourceType() !== 'Document') return false;
    // redirect all pages to `index.html`.
    const headers = { 'content-type': 'text/html' };
    const body = await afs.readFile(path.join(buildDir, 'index.html'));
    request.fulfill({ status: 200, headers, body });
    return true;
  });
  return app;
};

export const pipeFullscreen = (fullscreen?: boolean): Pipe => async app => {
  const window = app.mainWindow();
  Core.main.emitter.on('fullscreen', () => window && window.fullscreen());
  fullscreen && Core.main.fullscreen();
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

export const pipeExit = (): Pipe => async app => {
  app.on('exit', () => process.exit());
  return app;
};

export * from './mod';
