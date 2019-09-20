/** utility hooks. */

import { DependencyList, MutableRefObject, RefObject, useEffect, useMemo, useRef, useState } from 'react';

type Closeable = | { destroy: () => void } | { remove: () => void } | { close: () => void };

/** `Frozen` property should never be changed after mounted. */
export type Frozen<T> = T & { '　NEVER_UPDATE'?: never };

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
  supplier: Frozen<(closeRef: RefObject<boolean>) => Promise<T>>,
  close: (value: T) => void = defaultClose,
  deps: DependencyList = []
): T | undefined => {
  const closeRef = useRef(false);
  const [state, setState] = useState(undefined as T | undefined);
  useEffect(() => {
    const promise = Promise.resolve(supplier(closeRef));
    closeRef.current || promise.then(setState);
    return () => {
      closeRef.current = true;
      promise.then(close);
    };
  }, deps);
  return state;
};

// deprected.
// export const useUpdate: typeof useEffect = (
//   update: EffectCallback,
//   deps: DependencyList = []
// ): void => {
//   useMemo(update, []);
//   useEffect(update, deps);
// };

export interface PromiseRef<T> extends PromiseLike<T>, MutableRefObject<T | null> { }

export const usePromiseRef = <V>(): PromiseRef<V> => useMemo((): PromiseRef<V> => {
  let value: V | null = null;
  let setValue: (value: V | PromiseLike<V>) => void;
  const promise = new Promise<V>(resolve => setValue = resolve);
  return {
    set current(instance) {
      value = instance;
      instance == null || setValue(instance);
    },
    get current() { return value; },
    then: promise.then.bind(promise),
  };
}, []);
