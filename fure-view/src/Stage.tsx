import React, { ReactElement, ReactNode, useCallback, useEffect } from 'react';
import * as PIXI from 'pixi.js';
import { ContainerContext, useContainer } from './Container';
import { useCloseable } from './hooks';
import { useRenderer } from './Renderer';
import { useTicker } from './Ticker';

interface Props {
  children?: ReactNode;
}

export const StageContext = ContainerContext; // `Stage` is just alias of `Container`

export const Stage = ({ children }: Props): ReactElement => {
  const container = useCloseable(() => new PIXI.Container());
  return <StageContext.Provider value={container}>{children}</StageContext.Provider>;
};

export const useStage = useContainer;

/** `LazyRefresh` would refresh the `stage` only if the node was re-rendered. */
Stage.LazyRefresh = () => {
  const stage = useStage();
  const renderer = useRenderer();
  const ticker = useTicker();
  const refresh = useCallback(() => renderer.render(stage), []);
  ticker ? ticker.addOnce(refresh) : refresh();
  return null;
};
(Stage.LazyRefresh as any).displayName = 'Stage.LazyRefresh'; // eslint-disable-line @typescript-eslint/no-explicit-any

/** `TickRefresh` would re-render each time the ticker frame updated. */
Stage.TickRefresh = () => {
  const stage = useStage();
  const renderer = useRenderer();
  const ticker = useTicker();
  useEffect(() => {
    const refresh = (): void => renderer.render(stage);
    ticker.add(refresh);
    return () => { ticker.remove(refresh); };
  }, []);
  return null;
};
(Stage.TickRefresh as any).displayName = 'Stage.TickRefresh'; // eslint-disable-line @typescript-eslint/no-explicit-any
