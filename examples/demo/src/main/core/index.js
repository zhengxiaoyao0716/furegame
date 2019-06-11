import { Core } from '@fure/core';
import { Subject, Subscription } from 'rxjs';

export const LogicDecoupling = (() => {
  const subject: Subject<{
  }> = new Subject();

  const subscriptions: Subscription[] = [];

  const events = {
    start(level: number) {
      console.log('LogicDecoupling.start (view):', level);
    },
    stop() {
      subscriptions.forEach(sub => sub.unsubscribe());
    },
  };
  return new Core('LogicDecoupling', events, subject);
})();
