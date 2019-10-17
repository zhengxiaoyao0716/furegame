import { Subject, Subscription, asyncScheduler, fromEvent } from 'rxjs';
import { filter, take, throttleTime } from 'rxjs/operators';
import { Core } from './Core';
import { pick } from './rx';

const requestTimer = (
  typeof window === 'undefined'
    ? ((): (cb: (time: number) => void) => void => {
      const start = new Date().getTime();
      return cb => setTimeout(() => cb(new Date().getTime() - start), 1000 / 60);
    })()
    : ((): (cb: (time: number) => void) => void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = window as any; // eslint-disable-line no-undef

      // if ((g.performance && g.performance.now) instanceof Function) {
      //   return cb => g.requestAnimationFrame(() => cb(g.performance.now()));
      // }
      return g.requestAnimationFrame;
    })()
);

export class Ticker {
  public readonly id: string;

  //#region timer

  private time = { now: 0, offset: 0, run: 0, delta: 0 }

  /** elapsed time from start. */
  public get now(): number {
    return this.time.now + this.time.offset;
  }
  /** now - pauseTime */
  public get runTime(): number {
    return this.time.run;
  }
  /** now - lastTime, `0` if ticker not running. */
  public get deltaTime(): number {
    return this.time.delta;
  }
  public get FPS(): number {
    if (!this.time.delta) return 0;
    return 1000 / this.time.delta;
  }

  public autoStart: boolean;

  public readonly pipe: Subject<number>['pipe'];
  // execute `fn` each tick.
  public each(fn: (delta: number) => void): Subscription {
    this._running || this.autoStart && this.start();
    return this.pipe().subscribe(fn);
  }
  // execute `fn` once at next tick.
  public once(fn: (delta: number) => void): Subscription {
    this._running || this.autoStart && this.start();
    return this.pipe(take(1)).subscribe(fn);
  }

  private _running = false;
  public get running(): boolean { return this._running; }
  //#endregion

  //#region controller

  public readonly core: Core<{ start: () => void; pause: () => void }, {}>;
  // start ticker
  public start(): Promise<void> { return this.core.events.start(); }
  // pause ticker
  public pause(): Promise<void> { return this.core.events.pause(); }
  //#endregion

  public static shared = new Ticker('shared', true);

  /**
   * Ticker.
   * if you create a new `Ticker`, then in most time you shoud registered it into `main` app by `pipeCore`.
   * @param id .
   * @param autoStart if `true` it would invoke `start()` automatically when `each`, `once` was called.
   * @param syncPeriod default is `100`, it will sync timer betweenn browser and back-end each `syncPeriod` millisecond.
   */
  public constructor(id: string, autoStart = false, syncPeriod = 100) {
    this.id = id;
    this.autoStart = autoStart;

    //#region init core
    const core = (() => {
      const subject = new Subject<{
        running?: boolean;
        time?: { offset: number };
      }>();
      const events = {
        start: () => subject.next({ running: true }),
        pause: () => subject.next({ running: false }),
        sync: (offset: number) => subject.next({ time: { offset } }),
      };
      return new Core(`_FURE_CORE_TICKER-${id}`, events, subject);
    })();
    this.core = core;
    //#endregion

    //#region init timer

    const timer = new Subject<number>();
    const render = (now: number): void => {
      const delta = now - this.time.now;
      this.time.now = now;
      this.time.delta = 0;
      if (!this._running) return;
      requestTimer(render);

      if (render.skipOnBack) {
        render.skipOnBack = false;
        // eslint-disable-next-line no-console
        console.info(`timer#${id} skipped a frame about ${delta}ms because the window has hide.`);
        return;
      }
      if (delta <= 0 || delta > 1000) return;
      this.time.delta = delta;
      this.time.run += delta;
      timer.next(delta);
    };
    core.pipe(pick('running')).subscribe(running => {
      this._running = running;
      running && requestTimer(render);
    });

    this.pipe = timer.pipe.bind(timer);
    //#endregion

    //#region sync ticker

    // backend.now == browser.now == browser.time.now + browser.time.offset
    if (typeof window === 'undefined') {
      syncPeriod > 0 && timer
        .pipe(throttleTime(syncPeriod, asyncScheduler, { leading: true, trailing: false }))
        .subscribe(_delta => core.events.sync(new Date().getTime() - this.time.now));
    } else {
      core.pipe(pick('time')).subscribe(({ offset }) => this.time.offset = new Date().getTime() - this.time.now - offset);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = window as any; // eslint-disable-line no-undef
      // listen visibility change event to skip the first frame after the window changed.
      fromEvent(g, 'visibilitychange')
        .pipe(filter(() => g.document.visibilityState === 'visible'))
        .subscribe(_visibile => render.skipOnBack = true);
      render.skipOnBack = false;
    }
    //#endregion
  }
}
