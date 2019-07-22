import { ReactElement, useMemo } from 'react';
import { Gradient } from '.';

type Radian = number;
interface CircularState {
  rotate: Radian;
  frames: number;
  distance: number;
  direction: Radian;
  position: [number, number];
}

export interface Props extends CircularState {
  children?: (state: { x: number; y: number; angle: Radian } & CircularState) => ReactElement;
}
// TODO .
const Circular = ({ position, rotate, frames, distance, direction, children }: Props): ReactElement | null => {
  const state = useMemo(() => [[0, rotate, frames, distance, direction, ...position], [rotate / frames]], [rotate, frames, distance, direction, ...position]);
  const decorate = (children?: Props['children']): ((state: number[][]) => ReactElement) | undefined => {
    if (children == null) return children;
    return ([[offset, rotate, frames, distance, direction, positionX, positionY]]) => {
      const halfRotate = rotate / 2;
      const velocity = distance / Math.sin(halfRotate) / 2;
      const initial = direction - halfRotate;
      const x = positionX + velocity * (Math.cos(initial) * Math.sin(offset) + Math.sin(initial) * Math.cos(offset) - Math.sin(initial));
      const y = positionY + velocity * (Math.sin(initial) * Math.sin(offset) - Math.cos(initial) * Math.cos(offset) + Math.cos(initial));
      const angle = initial + offset;
      return children({ x, y, angle, rotate, frames, distance, direction, position });
    };
  };
  return Gradient({ ...Gradient.Velocity(state), children: decorate(children) });
};
Circular.displayName = 'Gradient.VelocityCircular';
export default Circular;
