import { Subject } from 'rxjs';
import { Core, Events } from '../core';

type EventEmitter = import('events').EventEmitter; // only used as type for `main` module.

export class MainCore<E extends Events, M> extends Core<E, M> {
  public readonly emitter: EventEmitter;

  public constructor(emitter: EventEmitter, events: E, subject: Subject<M>) {
    super('main', events, subject);
    this.emitter = emitter;
  }
}

const main = new MainCore(
  /* stub! */undefined as unknown as EventEmitter,
  {
    async emit(...args: Parameters<EventEmitter['emit']>) { /* stub! */ return false; }, // eslint-disable-line @typescript-eslint/no-unused-vars
    async fullscreen() { /* stub! */ return false; },
  },
  new Subject()
);
export default main;

if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-undef
  window.addEventListener('load', (...args) => main.events.emit('load', ...args));
}
