import { Subject } from 'rxjs';

export interface Events { [event: string]: (...args: any) => Promise<any> | any } // eslint-disable-line @typescript-eslint/no-explicit-any

export class Core<E extends Events, M> {
  public readonly id: string;
  public readonly rpc: (event: keyof Events, ...args: Parameters<Events[keyof Events]>) => Promise<ReturnType<Events[keyof Events]>>;
  public readonly events: E;
  public readonly pipe: Subject<M>['pipe'];

  public constructor(id: string, events: E, subject: Subject<M>) {
    this.id = id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = typeof window === 'undefined' ? {} : window as any; // eslint-disable-line no-undef
    if (g[`_fure_core_rpc-${id}`] instanceof Function) {
      this.rpc = g[`_fure_core_rpc-${id}`];
      g[`_fure_core_subject-${id}`] = subject;
      this.events = Object.keys(events).reduce((dict, key) => ({ ...dict, [key]: this.rpc.bind(null, key) }), {}) as E;
    } else {
      this.rpc = (event, ...args) => Promise.resolve(events[event](...args));
      (this as any)[`_fure_core_subject-${id}`] = subject; // eslint-disable-line @typescript-eslint/no-explicit-any
      this.events = events;
    }
    this.pipe = subject.pipe.bind(subject);
  }
}

export type CoreEvents<C> = C extends Core<infer E, infer _M> ? E : never;
export type CoreMessage<C> = C extends Core<infer _E, infer M> ? M : never;
