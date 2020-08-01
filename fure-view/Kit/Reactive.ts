import { Kit } from "./mod.ts";
import { OptPromise } from "../../fure-core/_util/mod.ts";

export interface State<T> {
  // listen
  0: <L extends (value: T) => void>(peeker: L) => (/*cancel*/ () => L);
  // update
  1: (mapper: (value: T) => OptPromise<T>) => Promise<void>;
}

const symbol$stateId = Symbol("stateId");
export interface Reactive {
  [symbol$stateId]: number;
  state<T>(init: T): State<T>;
}

Kit.prototype[symbol$stateId] = 0;
Kit.prototype.state = function <T>(init: T): State<T> {
  const id = Kit.prototype[symbol$stateId]++;
  const name = `_FURE_VIEW_STATE(${this.name})#${id}`;

  let state = init;
  const listen: State<T>[0] = (peeker) => {
    const listener = () => peeker(state);
    this.addEventListener(name, listener);
    return () => {
      this.removeEventListener(name, listener);
      return peeker;
    };
  };
  const update: State<T>[1] = async (mapper) => {
    state = await Promise.resolve(mapper(state));
    this.dispatchEvent(new Event(name));
  };
  return [listen, update];
};
