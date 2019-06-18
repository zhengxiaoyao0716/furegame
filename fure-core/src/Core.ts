import { Subject, interval } from 'rxjs';
import { take } from 'rxjs/operators';

export interface Events { [event: string]: (...args: any) => Promise<any> | any } // eslint-disable-line @typescript-eslint/no-explicit-any

export class Core<E extends Events, M> {
  public readonly rpcId: string;
  public readonly subjectId: string;
  public readonly pipe: Subject<M>['pipe'];
  public readonly rpc: (event: keyof Events, ...args: Parameters<Events[keyof Events]>) => Promise<ReturnType<Events[keyof Events]>>;
  public readonly events: E;

  public constructor(id: string, events: E, subject: Subject<M>) {
    this.rpcId = `_fure_core_rpc-${id}`;
    this.subjectId = `_fure_core_subject-${id}`;

    this.pipe = subject.pipe.bind(subject);

    //#region BACKEND
    if (typeof window === 'undefined') {
      this.rpc = (event, ...args) => Promise.resolve(events[event](...args));
      this.events = events;
      // expose `subject` for the main process of `carlo` to listen from.
      (this as any)[this.subjectId] = subject; // eslint-disable-line @typescript-eslint/no-explicit-any
      return;
    }
    //#endregion

    //#region FRONTEND
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = window as any; // eslint-disable-line no-undef
    if (g[this.rpcId] instanceof Function) {
      this.rpc = g[this.rpcId];
      this.events = Object.keys(events).reduce((dict, key) => ({ ...dict, [key]: this.rpc.bind(null, key) }), {}) as E;
      // expose `subject` for the view process of `carlo` to send forward.
      g[this.subjectId] = subject;
      return;
    }
    //#endregion

    //#region FRONT-ONLY MOCK
    this.rpc = (event, ...args) => Promise.resolve(events[event](...args));
    this.events = Object.keys(events).reduce((dict: {}, key) => ({
      ...dict, [key]: (...args: Parameters<Events[keyof Events]>) => {
        // delay 1ms to emulate the frontend-backend RPC call delay.
        return interval(1).pipe(take(1)).toPromise().then(() => this.rpc(key, ...args));
      },
    }), {}) as E;
    //#endregion
  }
}

export type CoreEvents<C> = C extends Core<infer E, infer _M> ? E : never;
export type CoreMessage<C> = C extends Core<infer _E, infer M> ? M : never;
