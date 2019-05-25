import React, { ReactElement, ReactNode, createContext, useContext, useDebugValue } from 'react';
import * as PIXI from 'pixi.js';
import { useCloseable, useUpdate } from './hooks';

interface Props {
  children?: ReactNode;
  running?: boolean;
  speed?: number;
  minFPS?: number;
}

export const TickerContext = createContext(PIXI.Ticker.shared);
TickerContext.displayName = 'Ticker';

class SafeCloseableTicker extends PIXI.Ticker { // patch for [#5653](https://github.com/pixijs/pixi.js/issues/5653)
  private _destroyed = false;

  public remove(...args: Parameters<typeof PIXI.Ticker.shared.remove>): SafeCloseableTicker {
    this._destroyed || super.remove(...args);
    return this;
  }

  public destroy(): void {
    this._destroyed = true;
    super.destroy();
  }
}

export const Ticker = ({ children, running = true, speed = 1, minFPS = 10 }: Props): ReactElement => {
  const ticker = useCloseable(() => new SafeCloseableTicker());

  useUpdate(() => {
    if (running !== ticker.started) running ? ticker.start() : ticker.stop();
    if (speed !== ticker.speed) ticker.speed = speed;
    if (minFPS !== ticker.minFPS) ticker.minFPS = minFPS;
  }, [running, speed, minFPS]);

  return <TickerContext.Provider value={ticker}>{children}</TickerContext.Provider>;
};

export const useTicker = (): PIXI.Ticker => {
  const ticker = useContext(TickerContext);
  useDebugValue(ticker, ticker => ticker.FPS.toFixed(2));
  return ticker;
};
