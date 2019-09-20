import { useEffect, useMemo } from 'react';
import * as Matter from 'matter-js';
import { useEngine } from './World';
import { useRenderer } from '../Renderer';

const eventNames = ['mousedown', 'mousemove', 'enddrag', 'mouseup'] as const;
type EventName = typeof eventNames[number];
type EventCallback = (event: { name: string; source: Matter.MouseConstraint; mouse: Matter.Mouse }) => void;

export interface Props {
  events: { [P in EventName]?: EventCallback };
}
export const Mouse = ({ events = {} }: Props): null => {
  const renderer = useRenderer();
  const engine = useEngine();

  const mouseConstraint = useMemo(() => {
    const mouse = Matter.Mouse.create(renderer.view);
    engine.render && ((engine.render as any).mouse = mouse); // eslint-disable-line @typescript-eslint/no-explicit-any
    const constraint = {
      stiffness: 0.2,
      render: {
        visible: false,
      },
    } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    return Matter.MouseConstraint.create(engine, { mouse, constraint });
  }, []);

  useEffect(() => {
    Matter.World.add(engine.world, mouseConstraint.constraint);
    return () => { Matter.World.remove(engine.world, mouseConstraint.constraint); };
  }, [engine]);

  eventNames.forEach(name => useEffect(() => {
    const callback = events[name];
    if (callback == null) return;
    Matter.Events.on(mouseConstraint, name, callback);
    return () => Matter.Events.off(mouseConstraint, name, callback);
  }, [events[name]]));

  return null;
};
