import carlo from 'carlo';
import { Subject } from 'rxjs';
import { Core, Events } from '@fure/core';

interface Pipe {
  (app: carlo.App): Promise<carlo.App>;
}

export const pipeCore = <E extends Events, D>(core: Core<E, D>): Pipe => async app => {
  await app.exposeFunction('fure-core-rpc', core.rpc);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subject = (core as any)['fure-core-subject'] as Subject<D>;
  subject.subscribe({
    next: data => app && app.evaluate(data => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = window as any; // eslint-disable-line no-undef
      return g['fure-core-subject'].next(data);
    }, data as any), // eslint-disable-line @typescript-eslint/no-explicit-any
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

export const main = async <E extends Events, D>(
  core: Core<E, D>, page?: string, fullscreen?: boolean
): Promise<carlo.App> => {
  const app = await carlo.launch()
    .then(pipeCore(core))
    .then(pipeFullscreen(fullscreen))
    ;
  app.on('exit', () => process.exit());
  if (page != null) await pipeLoad(page)(app);
  return app;
};
