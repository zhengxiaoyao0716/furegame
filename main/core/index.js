"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LogicDecoupling = void 0;

var _core = require("@fure/core");

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

const LogicDecoupling = (() => {
  const subject = new _rxjs.Subject();

  const newBubble = () => {
    let life = 5;
    return {
      /** @type {Attr} */
      attr: undefined,

      get() {
        return life;
      },

      inc(attr) {
        if (life < 9) {
          if (attr !== this.attr) {
            subject.next({
              message: 'miss'
            });
            return;
          }

          life++;
          subject.next({
            life
          });
          return;
        }

        this.inc = () => subject.next({
          life,
          message: 'GAME PASS'
        });

        this.dec = () => {};

        subject.next({
          life,
          message: 'YOU WIN'
        });
      },

      dec() {
        life -= 1 / 60;

        if (life > 0) {
          subject.next({
            life
          });
          return;
        }

        life = 0;

        this.inc = () => subject.next({
          life,
          message: 'GAME OVER'
        });

        this.dec = () => {};

        subject.next({
          life,
          message: 'BOO~OOM'
        });
      }

    };
  };

  let bubble;
  const players = new Set();
  const subscriptions = new Set();
  const events = {
    join(playerName, playerAttr) {
      if (players.has(playerName)) return;
      players.add(playerName);
      subject.next({
        message: `${playerName} (${playerAttr}) joined.`
      });
      if (players.size < 2) return; // game start

      bubble = newBubble();
      const readyTimer = (0, _rxjs.from)(['READY...', 'GO!!!']).pipe((0, _operators.zip)((0, _rxjs.interval)(500), message => message));
      subscriptions.add(readyTimer.subscribe(message => subject.next({
        message
      })));
      subscriptions.add((0, _rxjs.timer)(1500, 1000 / 60).subscribe(() => bubble.dec()));
      const bubbleTimer = (0, _rxjs.timer)(1500, 500).pipe((0, _operators.tap)(() => bubble.attr = Math.random() < 0.5 ? 'fire' : 'water'));
      subscriptions.add(bubbleTimer.subscribe(() => subject.next({
        attr: bubble.attr
      })));
    },

    blow(playerAttr) {
      bubble.inc(playerAttr);
    },

    leave(player) {
      players.delete(player);
      subject.next({
        message: `${player} leaved.`
      });
      if (players.size > 0) return; // game stop

      subscriptions.forEach(sub => sub.unsubscribe());
      subscriptions.clear();
    }

  };
  return new _core.Core('LogicDecoupling', events, subject);
})();

exports.LogicDecoupling = LogicDecoupling;