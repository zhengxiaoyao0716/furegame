import { useEffect } from 'react';
import * as Matter from 'matter-js';
import { useEngine } from './World';

export const Mouse = (): null => {
  const engine = useEngine();
  useEffect(() => {
    const mouse = Matter.Mouse.create(engine.render.canvas);
    (engine.render as any).mouse = mouse; // eslint-disable-line @typescript-eslint/no-explicit-any
    const constraint = {
      stiffness: 0.2,
      render: {
        visible: false,
      },
    } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const mouseConstraint = Matter.MouseConstraint.create(engine, { mouse, constraint });
    Matter.World.add(engine.world, mouseConstraint.constraint);
    return () => { Matter.World.remove(engine.world, mouseConstraint.constraint); };
  }, [engine]);
  return null;
};
