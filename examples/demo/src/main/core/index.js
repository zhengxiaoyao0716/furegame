import { Config, Core } from '@fure/core';
import { Subject, Subscription, from, interval, timer } from 'rxjs';
import { tap, zip } from 'rxjs/operators';

export const Configuration: Config<{
  background: number;
}> = new Config(`${process.env.PUBLIC_URL}/config/Configuration.json`);

export const LogicDecoupling = (() => {
  type Attr = | 'fire' | 'water';

  const subject: Subject<Partial<{
    life: number;
    attr: Attr;
    message: string;
  }>> = new Subject();

  const newBubble = () => {
    let life = 5;
    return {
      /** @type {Attr} */attr: undefined,
      get() { return life; },
      inc(attr: Attr) {
        if (life < 9) {
          if (attr !== this.attr) {
            subject.next({ message: 'miss' });
            return;
          }
          life++;
          subject.next({ life });
          return;
        }

        this.inc = () => subject.next({ life, message: 'GAME PASS' });
        this.dec = () => { };
        subject.next({ life, message: 'YOU WIN' });
      },
      dec() {
        life -= 1 / 60;
        if (life > 0) {
          subject.next({ life });
          return;
        }

        life = 0;
        this.inc = () => subject.next({ life, message: 'GAME OVER' });
        this.dec = () => { };
        subject.next({ life, message: 'BOO~OOM' });
      },
    };
  };
  let bubble: ReturnType<typeof newBubble>;
  const players: Set<string> = new Set();

  const subscriptions: Set<Subscription> = new Set();

  const events = {
    join(playerName: string, playerAttr: Attr) {
      if (players.has(playerName)) return;
      players.add(playerName);
      subject.next({ message: `${playerName} (${playerAttr}) joined.` });
      if (players.size < 2) return;

      // game start
      bubble = newBubble();

      const readyTimer = from(['READY...', 'GO!!!']).pipe(zip(interval(500), message => message));
      subscriptions.add(readyTimer.subscribe(message => subject.next({ message })));

      subscriptions.add(timer(1500, 1000 / 60).subscribe(() => bubble.dec()));

      const bubbleTimer = timer(1500, 500).pipe(tap(() => bubble.attr = Math.random() < 0.5 ? 'fire' : 'water'));
      subscriptions.add(bubbleTimer.subscribe(() => subject.next({ attr: bubble.attr })));
    },
    blow(playerAttr: Attr) {
      bubble.inc(playerAttr);
    },
    leave(player: string) {
      players.delete(player);
      subject.next({ message: `${player} leaved.` });
      if (players.size > 0) return;

      // game stop
      subscriptions.forEach(sub => sub.unsubscribe());
      subscriptions.clear();
    },
  };
  return new Core('LogicDecoupling', events, subject);
})();
