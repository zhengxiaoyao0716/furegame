/** utility hooks. */

import { DependencyList, EffectCallback, useEffect, useMemo, useState } from 'react';

type Closeable = | { destroy: () => void } | { remove: () => void } | { close: () => void };

/** `Frozen` property should never be changed after mounted. */
export type Frozen<T> = T & { [P in keyof T]: T[P] };

export const defaultClose = (value: Closeable | {}): void => ('close' in value ? value.close() : 'destroy' in value ? value.destroy() : 'remove' in value ? value.remove() : undefined);

export const useCloseable = <T>(
  supplier: Frozen<() => T>,
  close: (value: T) => void = defaultClose,
  deps: DependencyList = []
): T => {
  const state = useMemo(supplier, []);
  useEffect(() => () => close(state), deps);
  return state;
};

export const useCloseableAsync = <T>(
  supplier: Frozen<() => Promise<T>>,
  close: (value: T) => void = defaultClose,
  deps: DependencyList = []
): T | undefined => {
  const [state, setState] = useState(undefined as T | undefined);
  useEffect(() => {
    const promise = Promise.resolve(supplier());
    promise.then(setState);
    return () => { promise.then(close); };
  }, deps);
  return state;
};

export const useUpdate: typeof useEffect = (
  update: EffectCallback,
  deps: DependencyList = []
): void => {
  useMemo(update, []);
  useEffect(update, deps);
};
