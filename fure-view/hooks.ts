function checkHooksContext(context: unknown) {
  if (Array.isArray(context)) return true;
  throw new Error(`hooks context not found`);
}

export function useMemo<R>(ctx: [], fn: () => R, deps: any): R {
  checkHooksContext(ctx);
  // TODO
  return fn();
}

export function useCallback<R extends Function>(ctx: [], cb: R, deps: any): R {
  return useMemo(ctx, () => cb, deps);
}
