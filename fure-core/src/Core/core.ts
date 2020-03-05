import { Subject, interval } from 'rxjs';
import { take } from 'rxjs/operators';

export class Core<Msg> {
  public readonly id: string | number;
  public readonly rpcId: string;
  public readonly msgId: string;
  public readonly next: Subject<Msg>['next'];
  public readonly pipe: Subject<Msg>['pipe'];

  /**
   * create new rpc method.
   * @param method method would post to main moduke to executed.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public rpc<P extends unknown[], R extends Promise<unknown>>(method: (...args: P) => R): (...args: P) => R {
    throw new Error('Stub!');
  }

  public constructor(id: string | number, subject: Subject<Msg>) {
    this.id = id;
    this.rpcId = `_FURE_CORE-rpc#${id}`;
    this.msgId = `_FURE_CORE-msg#${id}`;
    this.next = subject.next.bind(subject);
    this.pipe = subject.pipe.bind(subject);

    //#region BACKEND
    if (typeof window === 'undefined') {
      const methods = [] as Function[];
      (this as any)[this.rpcId] = (mid: number, ...args: unknown[]) => methods[mid](...args); // eslint-disable-line @typescript-eslint/no-explicit-any
      this.rpc = method => {
        methods.push(method);
        return method;
      };
      return;
    }
    //#endregion

    //#region FRONTEND
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = window as any; // eslint-disable-line no-undef
    if (g[this.rpcId] instanceof Function) {
      // expose `subject` to window for the main process of `carlo` to execute at app page context.
      g[this.msgId] = subject.next.bind(subject);

      let index = 0;
      this.rpc = () => {
        const mid = index++;
        return (...args) => g[this.rpcId](mid, ...args);
      };
      return;
    }
    //#endregion

    //#region FRONT-ONLY MOCK
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.rpc = method => (...args) => interval(1).pipe(take(1)).toPromise().then(() => method(...args)) as any;
    //#endregion
  }

  public static readonly main: typeof import('./main').default = (() => {
    const main = require('./main').default;
    if (typeof window !== 'undefined') return main;
    return require('./main/main').default as typeof main;
  })();
}
