import React, { ReactElement, ReactNode, createContext, useContext, useDebugValue, useMemo } from 'react';
import * as PIXI from 'pixi.js';
import { useCloseable, useUpdate } from './hooks';

interface Props extends LoaderOptions {
  children?: ReactNode;
}

export const LoaderContext = createContext(PIXI.Loader.shared);
LoaderContext.displayName = 'Loader';

export const Loader = ({ children, baseUrl, concurrency }: Props): ReactElement => {
  const loader = useCloseable(() => new PIXI.Loader(baseUrl, concurrency));

  useUpdate(() => {
    if (baseUrl != null && baseUrl !== loader.baseUrl) loader.baseUrl = baseUrl;
    if (concurrency != null && concurrency !== loader.concurrency) loader.concurrency = concurrency;
  }, []);

  return <LoaderContext.Provider value={loader}>{children}</LoaderContext.Provider>;
};

export interface LoaderOptions { baseUrl?: string; concurrency?: number }
Loader.Creator = ({ baseUrl, concurrency }: LoaderOptions) => useMemo(() => ({ create: () => new PIXI.Loader(baseUrl, concurrency) }), []);

export const useLoader = (): PIXI.Loader => {
  const loader = useContext(LoaderContext);
  useDebugValue(loader.progress, progress => `progress: ${progress}`);
  return loader;
};
