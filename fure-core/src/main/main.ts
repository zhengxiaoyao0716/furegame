/* INNER INTERFACE, ONLY USED BY MAIN, NEVER EXPORT TO VIEW */

import { Subject } from 'rxjs';
import { EventEmitter } from 'events';
import { MainCore } from '.';

const emitter = new EventEmitter();

export default new MainCore(
  emitter,
  {
    emit(...args: Parameters<EventEmitter['emit']>) { emitter.emit(...args); },
    fullscreen(...args) { this.emit('fullscreen', ...args); },
  },
  new Subject()
);
