import React, { ReactElement, ReactNode, createContext, useContext, useDebugValue } from 'react';
import * as Matter from 'matter-js';
import { useRenderer } from '../Renderer';
import { useCloseable } from '../hooks';
import { useTicker } from '../Ticker';
import './World.css';
import { Mouse } from './Mouse';

interface Props extends Matter.IRendererOptions {
  children?: ReactNode;
  element?: HTMLElement | 'debug'; // `undefined`: no debug render, `HTMLElement`: draw debug render on given element, `true`: append debug render after `view`.
}

export const EngineContext = createContext(undefined as Matter.Engine | undefined);
EngineContext.displayName = 'World.Engine';

export const World = ({ children, element, ...options }: Props): ReactElement => {
  const renderer = useRenderer();
  const ticker = useTicker();
  const engine = useCloseable(() => {
    const engine = Matter.Engine.create();
    // Matter.Engine.run(engine);
    ticker.each(delta => Matter.Engine.update(engine, delta));
    if (element == null) return engine;

    const renderOptions = {
      width: renderer.width,
      height: renderer.height,
      wireframeBackground: 'transparent',
      showPositions: true,
      showBounds: true,
      showVelocity: true,
      showCollisions: true,
      ...options,
    };
    const render = Matter.Render.create({
      engine,
      element: element === 'debug' ? renderer.view.parentElement as HTMLElement : element,
      options: renderOptions,
    });
    render.canvas.id = 'world';
    Matter.Render.run(render);
    engine.render = render;

    return engine;
  });

  return (
    <EngineContext.Provider value={engine}>
      {children}
    </EngineContext.Provider>
  );
};

export const useEngine = (): Matter.Engine => {
  const engine = useContext(EngineContext) as Matter.Engine;
  useDebugValue(engine, engine => {
    const g = window as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    // for debugger
    g.Matter = Matter;
    g.engine = engine;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-debugger
    if ((useEngine as any).firstDebug !== false) { debugger; (useEngine as any).firstDebug = false; }
    return `engine#${engine.world.id}`;
  });
  return engine;
};
export const useWorld = (): Matter.World => (useEngine() || {}).world;

World.Mouse = Mouse;
