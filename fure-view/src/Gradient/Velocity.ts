import { useCallback } from 'react';
import { GradientFn, PointsFn } from '.';

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

export default (state: State) => {
  const pointsFn: PointsFn<State> = useCallback(() => [state], [state]);
  const gradientFn = useCallback(velocityGradientFn(), [state]);
  return { pointsFn, gradientFn };
};
