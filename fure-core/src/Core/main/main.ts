/* INNER INTERFACE, ONLY USED BY MAIN, NEVER EXPORT TO VIEW */

import { Subject } from 'rxjs';
import { EventEmitter } from 'events';
import { MainCore } from '.';

const emitter = new EventEmitter();

export default new MainCore(
  emitter,
  {
    async emit(...args: Parameters<EventEmitter['emit']>) { return emitter.emit(...args); },
    async fullscreen(...args) { return emitter.emit('fullscreen', ...args); },
  },
  new Subject()
);
