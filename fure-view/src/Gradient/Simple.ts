import { ReactElement, useCallback } from 'react';
import { ChildrenFn, GradientFn, PointsFn, useGradient } from './Gradient';

interface State { state: number; time: number }

const simplePointsFn = (state: number): PointsFn<State> => (
  (ticker, points) => [{ state, time: ticker.now }, ...points.slice(0, 1)]
);

const simpleGradientFn = (): GradientFn<State, number> => (
  (ticker, [point0, point1], state) => {
    if (point1 == null) return 0;
    if (state === point0.state) return point0.state;

    const remain = (point0.time - point1.time) - (ticker.now - point0.time);
    const interp = state + (point0.state - state) / remain * ticker.deltaTime;

    return Math.max(state, Math.min(interp, point0.state));
  }
);

export const simpleFn = (state: number): [PointsFn<State>, GradientFn<State, number>] => {
  const pointsFn = useCallback(simplePointsFn(state), [state]);
  const gradientFn = useCallback(simpleGradientFn(), []);
  return [pointsFn, gradientFn];
};

export const Simple = ({ children, state }: { children: ChildrenFn<number>; state: number }): ReactElement => {
  const pipe = useGradient(...simpleFn(state));
  return children(pipe);
};
Simple.displayName = 'Gradient.Simple';
