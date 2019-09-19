import { ReactElement, useDebugValue, useEffect, useMemo, useRef } from 'react';
import { Ticker } from '@fure/core';
import { Subject } from 'rxjs';
import { useTicker } from '../Ticker';

export type PointsFn<P> = (ticker: Ticker, points: P[]) => P[];
export type GradientFn<P, S> = (ticker: Ticker, points: P[], state: S) => S;
export type ChildrenFn<S> = (pipe: Subject<S>['pipe']) => ReactElement;

export function useGradient<P, S>(pointsFn: PointsFn<P>, gradientFn: GradientFn<P, S>): Subject<S>['pipe'] {
  const ticker = useTicker();

  const points = useRef<P[]>([]);
  useEffect(() => {
    points.current = pointsFn(ticker, points.current);
  }, [pointsFn]);

  const [state, setState] = useMemo(() => {
    const subject = new Subject<S>();
    return [subject.pipe.bind(subject), (state: S) => subject.next(state)];
  }, []);
  useEffect(() => {
    let state: S;
    const sub = ticker.each(() => {
      state = gradientFn(ticker, points.current, state);
      setState(state);
    });
    return () => sub.unsubscribe();
  }, [gradientFn]);

  useDebugValue(state, JSON.stringify);
  return state;
}

export * from './Simple';
export * from './Velocity';
export * from './Circular';
