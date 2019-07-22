import React, { ReactElement, ReactNode, createContext, useContext, useDebugValue, useEffect } from 'react';
import { useUpdate } from '../hooks';
import { Ticker } from '@fure/core';
export * from './Subscribe';

interface Props {
  ticker?: Ticker;
  children?: ReactNode;
  running?: boolean;
}

export const TickerContext = createContext(Ticker.shared);
TickerContext.displayName = 'Ticker';

export const TickerController = ({ ticker = Ticker.shared, children = null, running = true }: Props): ReactElement => {
  useUpdate(() => {
    if (running !== ticker.running) running ? ticker.start() : ticker.pause();
  }, [running]);
  useEffect(() => {
    return () => { ticker.pause(); };
  }, []);

  return (
    <TickerContext.Provider value={ticker}>
      {children}
    </TickerContext.Provider>
  );
};

export const useTicker = (): Ticker => {
  const ticker = useContext(TickerContext);
  useDebugValue(ticker, ticker => ticker.FPS.toFixed(2));
  return ticker;
};
