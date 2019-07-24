import { ReactElement, useCallback } from 'react';
import { ChildrenFn, GradientFn, PointsFn, useGradient } from './Gradient';

type State = number[][];

const velocityGradientFn = (): GradientFn<State, State> => (
  (ticker, [point], state) => {
    if (state == null) return point;
    const { deltaTime } = ticker;

    const vectors = state.map(vector => [...vector]); // deep clone
    for (let index = 1; index < vectors.length; index++) {
      const vector = vectors[vectors.length - index];
      const previous = vectors[vectors.length - index - 1];
      vector.forEach((value, index) => previous[index] = previous[index] + value * deltaTime);
    }
    return vectors;
  }
);

export const velocityFn = (state: State): [PointsFn<State>, GradientFn<State, State>] => {
  const deps = state.map(vector => vector.join(','));
  const pointsFn: PointsFn<State> = useCallback(() => [state], deps);
  const gradientFn = useCallback(velocityGradientFn(), deps);
  return [pointsFn, gradientFn];
};

export const Velocity = ({ children, state }: { children: ChildrenFn<State>; state: State }): ReactElement => {
  const pipe = useGradient(...velocityFn(state));
  return children(pipe);
};
Velocity.displayName = 'Gradient.Velocity';
