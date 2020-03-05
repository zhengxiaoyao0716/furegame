import { Subject } from 'rxjs';
import { Core } from '../Core';

type EventEmitter = import('events').EventEmitter; // only used as type for `main` module.

class MainCore<M> extends Core<M> {
  public readonly emitter: EventEmitter;

  public constructor() {
    super('main', new Subject());
    this.emitter = /* Stub! */undefined as unknown as EventEmitter;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public readonly emit = this.rpc((...args: Parameters<EventEmitter['emit']>) => /*Stub!*/Promise.resolve(false));
  public readonly fullscreen = this.rpc(() => Promise.resolve(false));
}

const main = new MainCore();
export default main;

// eslint-disable-next-line no-undef
typeof window === 'undefined' || window.addEventListener('load', (...args) => main.emit('load', ...args));
