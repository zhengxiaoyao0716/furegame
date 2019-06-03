import { Subject } from 'rxjs';

export interface Events { [event: string]: (...args: any) => Promise<any> | any } // eslint-disable-line @typescript-eslint/no-explicit-any

export class Core<E extends Events, D> {
  public readonly events: E;
  public readonly rpc: (event: keyof Events, ...args: Parameters<Events[keyof Events]>) => Promise<ReturnType<Events[keyof Events]>>;
  public readonly pipe: Subject<D>['pipe'];

  public constructor(events: E, subject: Subject<D>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = typeof window === 'undefined' ? {} : window as any; // eslint-disable-line no-undef
    if (g['fure-core-rpc'] instanceof Function) {
      this.rpc = g['fure-core-rpc'];
      g['fure-core-subject'] = subject;
    } else {
      this.rpc = (event, ...args) => Promise.resolve(events[event](...args));
      (this as any)['fure-core-subject'] = subject; // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    // custom implements of RPC event, maybe we can simplify it after the `carlo/rpc` released.
    this.events = Object.keys(events).reduce((dict, key) => ({ ...dict, [key]: this.rpc.bind(null, key) }), {}) as E;
    this.pipe = subject.pipe.bind(subject);
  }
}
