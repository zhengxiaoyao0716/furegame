import { Kit } from "./mod.ts";
import { OptPromise } from "../../fure-core/_util/mod.ts";

interface Listen<T> {
  <L extends (value: T) => void>(peeker: L): (/*cancel*/ () => L);
}
interface Update<T> {
  (mapper: (value: T) => OptPromise<T>): Promise<void>;
}
export type State<T> = readonly [Listen<T>, Update<T>];

const symbol$stateId = Symbol("stateId");
export interface Reactive {
  [symbol$stateId]: number;
  state<T>(init: T): State<T>;
}

Kit.prototype[symbol$stateId] = 0;
Kit.prototype.state = function <T>(init?: T): State<T> {
  const id = ++this[symbol$stateId];
  const name = `_FURE_VIEW_STATE(${this.name})#${id.toString(16)}`;

  let state: T;
  if (init !== undefined) state = init;

  const listen: State<T>[0] = (peeker) => {
    const listener = () => peeker(state);
    this.addEventListener(name, listener);
    return () => {
      this.removeEventListener(name, listener);
      return peeker;
    };
  };
  listen.toString = () => `(listen)`;

  const update: State<T>[1] = async (mapper) => {
    state = await Promise.resolve(mapper(state));
    this.dispatchEvent(new Event(name));
  };
  update.toString = () => `(update)`;

  return [listen, update] as const;
};
