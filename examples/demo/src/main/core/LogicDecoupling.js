import { Core, CoreEvents, CoreMessage } from '@fure/core';
import { Subject } from 'rxjs';
import { LogicDecoupling } from '.';

type Message = CoreMessage<typeof LogicDecoupling>;
type Events = CoreEvents<typeof LogicDecoupling>;

const subject: Subject<Message> = new Subject();

const subscriptions: Subscription[] = [];

const events: Events = {
  start(level: number) {
    console.log('LogicDecoupling.start (main):', level);
  },
  stop() {
    subscriptions.forEach(sub => sub.unsubscribe());
  },
};

export default new Core('LogicDecoupling', events, subject);
