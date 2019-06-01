import * as PIXI from 'pixi.js';
import { Resource, makeResource } from './make';
import { useDebugValue, useMemo } from 'react';
import { useLoader } from '../Loader';
import { useCloseableAsync } from '../hooks';

interface UseResourceLoad {
  url: string;
  options?: PIXI.ILoaderOptions;
  callback?: Function;
}
type UseResourceLoadAsync = Promise<UseResourceLoad>;

interface UseResourceMake {
  (make: typeof makeResource): (id?: string, loader?: PIXI.Loader) => void;
}
type UseResourceMakeAsync = (...args: Parameters<UseResourceMake>) => Promise<ReturnType<UseResourceMake>>;

export interface UseResourceOptions {
  [name: string]: UseResourceLoad | UseResourceLoadAsync | UseResourceMake | UseResourceMakeAsync;
}

export const useResource = <T extends UseResourceOptions>(
  options: T,
  complete?: (resource: Record<keyof T, PIXI.LoaderResource>) => void | Promise<void>,
  unmount?: () => void,
): Record<keyof T, PIXI.LoaderResource> | null => {
  const resource = useMemo(() => ({}), []) as Record<keyof T, PIXI.LoaderResource>;
  const loader = useLoader();

  const completed = useCloseableAsync(
    (): Promise<boolean> => {
      // tasks of making and loading resources
      const tasks = Object.entries(options)
        .map(([name, option]) => (
          option instanceof Function
            ? ( // make resource
              Promise.resolve(option(makeResource)) // make resource
                .then(save => save(name, loader))   // save resource
                .then(() => { loader.emit('load', loader, loader.resources[name]); }) // emit load succeed event
                .catch((error: Error) => {
                  if (loader.resources[name] == null) { // make failed resource
                    const resource = new Resource(name, `#${name}`);
                    resource.error = error;
                    loader.resources[name] = resource;
                  }
                  loader.emit('error', error, loader, loader.resources[name]); // emit load failed event
                  throw error;
                })
                .finally(() => loader.emit('progress', loader, loader.resources[name])) //emit load finish event
            )
            : ( // load resource
              Promise.resolve(option)
                .then(({ url, options, callback }) => { loader.add(name, url, options, callback); })
            )
        ));

      // load finished callback
      const onLoad = (resolve: (value: boolean) => void): (() => Promise<void>) => () => {
        Object.defineProperties(resource, Object.keys(options).map(name => ({
          [name]: {
            configurable: true, enumerable: true,
            get() { return loader.resources[name]; },
          },
        })).reduce((dict, props) => ({ ...dict, ...props }), {}));
        return Promise.resolve((complete && complete(resource), true)).then(resolve);
      };

      // waits all tasks finished
      return Promise.all(tasks).then(() => new Promise(resolve => loader.load(onLoad(resolve))));
    },
    _completed => {
      unmount && unmount();
      loader.reset();
      PIXI.utils.clearTextureCache();
    },
  );

  useDebugValue(completed, completed => (completed ? 'finished' : 'loading'));
  return completed ? resource : null;
};
useResource.query = <T extends { [name: string]: PIXI.LoaderResource }>(resource: T): (
  <F extends keyof PIXI.LoaderResource>(field: F) => Partial<Record<keyof T, PIXI.LoaderResource[F]>>
) => useMemo(() => {
  if (resource == null) return _field => ({});
  return field => Object.entries(resource).reduce((dict, [name, value]) => ({ ...dict, [name]: value[field] }), {});
}, [resource]);
