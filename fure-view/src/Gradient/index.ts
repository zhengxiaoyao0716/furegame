import { ReactElement, useDebugValue, useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { useTicker } from '..';

import Simple from './Simple';
import Velocity from './Velocity';

export type PointsFn<P> = (ticker: PIXI.Ticker, points: P[]) => P[];
export type GradientFn<P, S> = (ticker: PIXI.Ticker, points: P[], state: S) => S;

export function useGradient<P, S>(pointsFn: PointsFn<P>, gradientFn: GradientFn<P, S>): S | undefined {
  const ticker = useTicker();

  const points = useRef([] as P[]);
  useEffect(() => {
    points.current = pointsFn(ticker, points.current);
  }, [pointsFn]);

  const [state, setState] = useState(undefined as S | undefined);
  useEffect(() => {
    let state: S;
    const gradient = (): void => {
      state = gradientFn(ticker, points.current, state);
      setState(state);
    };
    ticker.add(gradient);
    return () => { ticker.remove(gradient); };
  }, [gradientFn]);

  useDebugValue(state, JSON.stringify);
  return state;
}

interface Props<P, S> {
  pointsFn: PointsFn<P>;
  gradientFn: GradientFn<P, S>;
  children?: (state: S) => ReactElement;
}

export function Gradient<P, S>({ children, pointsFn, gradientFn }: Props<P, S>): ReactElement | null {
  const state = useGradient(pointsFn, gradientFn);
  if (state == null) return null;
  if (children == null) return null;
  return children(state);
}
Gradient.Simple = Simple;
Gradient.Velocity = Velocity;
