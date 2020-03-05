/* INNER INTERFACE, ONLY USED BY MAIN, NEVER EXPORT TO VIEW */

import { Subject } from 'rxjs';
import { EventEmitter } from 'events';
import { Core } from '..';

class MainCore<M> extends Core<M> {
  public readonly emitter: EventEmitter;

  public constructor() {
    super('main', new Subject());
    this.emitter = new EventEmitter();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public readonly emit = this.rpc(async (...args: Parameters<EventEmitter['emit']>) => this.emitter.emit(...args));
  public fullscreen(...args: unknown[]): Promise<boolean> { return this.emit('fullscreen', ...args); }
}

const main = new MainCore();
export default main;
