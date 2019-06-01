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

export const _patchPIXITicker = (ticker: PIXI.Ticker): PIXI.Ticker => { // patch for [#5653](https://github.com/pixijs/pixi.js/issues/5653)
  const remove = ticker.remove.bind(ticker);
  ticker.remove = (...args: Parameters<PIXI.Ticker['remove']>) => (ticker as any)._head && remove(...args); // eslint-disable-line @typescript-eslint/no-explicit-any
  return ticker;
};
_patchPIXITicker(PIXI.Ticker.shared);

export const Ticker = ({ children, running = true, speed = 1, minFPS = 10 }: Props): ReactElement => {
  const ticker = useCloseable(() => _patchPIXITicker(new PIXI.Ticker()));

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
