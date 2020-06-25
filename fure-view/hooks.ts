import { genDepsId } from "./diff.ts";

export const symHookIndex = Symbol("HookIndex");

export type HookStore<R> = {
  deps: string;
  result: R;
} | {
  deps?: undefined;
  result?: undefined;
};
export interface HookContext extends Array<HookStore<unknown>> {
  [symHookIndex]?: number;
}

function isHookContext<T extends HookContext>(
  context: T | void,
): context is T {
  return Array.isArray(context);
}
function getHookStore<R, S extends HookStore<R>>(ctx: HookContext | void): S {
  if (!isHookContext(ctx)) throw new Error(`hooks context not found`);

  const index = ctx[symHookIndex] || 0;
  ctx[symHookIndex] = 1 + index;
  if (ctx[index] == null) ctx[index] = {};
  return ctx[index] as S;
}

export function useMemo<R>(
  this: HookContext | void,
  fn: () => R,
  deps?: unknown,
): R {
  const store: HookStore<R> = getHookStore(this);
  const depsId = genDepsId(deps);
  if (store.deps && store.deps === depsId) return store.result;
  store.deps = depsId;
  store.result = fn();
  return store.result;
}

export function useCallback<R extends Function>(
  this: HookContext | void,
  cb: R,
  deps: any,
): R {
  return useMemo.call(this, () => cb, deps) as R;
}

interface SetState<T> {
  (state: T | Promise<T> | ((old: T) => T | Promise<T>)): void;
}

export interface USeStateContext extends HookContext {
  rerender: Function;
}
export function useState<T>(
  this: USeStateContext | void,
  init: T,
): [T, SetState<T>] {
  const store: HookStore<T> = getHookStore(this);
  if (!store.deps) {
    store.deps = "Initialized";
    store.result = init;
  }
  const setState: SetState<T> = async (state) => {
    const result = await Promise.resolve(
      state instanceof Function ? state(store.result as T) : state,
    );
    if (result == store.result) return;
    store.result = result;
    await Promise.resolve((this as USeStateContext).rerender());
  };
  return [store.result as T, setState];
}
