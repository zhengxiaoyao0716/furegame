import { ReactElement, useMemo } from 'react';
import { Velocity } from './Velocity';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChildrenFn } from './Gradient';

type Radian = number;
interface CircularState {
  rotate: Radian;
  frames: number;
  distance: number;
  direction: Radian;
  position: [number, number];
}

export interface Props {
  children: ChildrenFn<{ x: number; y: number; angle: Radian } & CircularState>;
  state: CircularState;
}

export const Circular = ({ children, state }: Props): ReactElement => {
  const { position, rotate, frames, distance, direction } = state;
  const velocityState = useMemo(() => [[0, rotate, frames, distance, direction, ...position], [rotate / frames]], [rotate, frames, distance, direction, ...position]);
  const decorate = (children: Props['children']): ((pipe: Subject<number[][]>['pipe']) => ReactElement) => {
    return pipe => {
      const obs = pipe(map(([[offset, rotate, frames, distance, direction, positionX, positionY]]) => {
        const halfRotate = rotate / 2;
        const velocity = distance / Math.sin(halfRotate) / 2;
        const initial = direction - halfRotate;
        const x = positionX + velocity * (Math.cos(initial) * Math.sin(offset) + Math.sin(initial) * Math.cos(offset) - Math.sin(initial));
        const y = positionY + velocity * (Math.sin(initial) * Math.sin(offset) - Math.cos(initial) * Math.cos(offset) + Math.cos(initial));
        const angle = initial + offset;
        return { x, y, angle, rotate, frames, distance, direction, position };
      }));
      return children(obs.pipe.bind(obs));
    };
  };
  return Velocity({ state: velocityState, children: decorate(children) });
};
Circular.displayName = 'Gradient.Circular';
