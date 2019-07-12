import React, { ReactElement, ReactNode, createContext, useContext } from 'react';
import * as Matter from 'matter-js';
import { useRenderer } from '../Renderer';
import { useCloseable } from '../hooks';

interface Props {
  children?: ReactNode;
  element?: HTMLElement | 'debug'; // `undefined`: no debug render, `HTMLElement`: draw debug render on given element, `true`: append debug render after `view`.
  options: Matter.IRendererOptions;
}

export const WorldContext = createContext(undefined as Matter.World | undefined);
WorldContext.displayName = 'World';

export const World = ({ children, element, options }: Props): ReactElement => {
  const renderer = useRenderer();
  const world = useCloseable(() => {
    const engine = Matter.Engine.create();
    const render = Matter.Render.create({
      engine,
      element: element === 'debug' ? renderer.view.parentElement as HTMLElement : element || undefined,
      options: {
        width: renderer.width,
        height: renderer.height,
        ...options,
      },
    });
    Matter.Engine.run(engine);
    Matter.Render.run(render);
    return engine.world;
  });
  return (
    <WorldContext.Provider value={world}>
      {children}
    </WorldContext.Provider>
  );
};

export const useWorld = (): Matter.World => useContext(WorldContext) as Matter.World;
