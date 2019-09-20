import React, { ReactElement, ReactNode, createContext, useContext, useDebugValue, useEffect } from 'react';
import * as Matter from 'matter-js';
import { useRenderer } from '../Renderer';
import { Frozen, useCloseable } from '../hooks';
import { useTicker } from '../Ticker';
import { Mouse } from './Mouse';
import { CompositeContext } from './Composite';
import { fromResize } from '../UI';
import { debounceTime } from 'rxjs/operators';

const eventNames = [
  'beforeAdd', 'afterAdd',
  'beforeRemove', 'afterRemove',
  'beforeUpdate', 'afterUpdate',
  'beforeRender', 'afterRender',
  'collisionStart', 'collisionActive', 'collisionEnd',
  'beforeTick', 'tick', 'afterTick',
  'beforeRender', 'afterRender',
] as const;
type EventName = typeof eventNames[number];
type EventCallback = (event: { name: string; source: Matter.Body } & Record<| string | number | symbol, unknown>) => void;

const defaultRenderOptions = {
  wireframeBackground: 'transparent',
  showPositions: true,
  showBounds: true,
  showVelocity: true,
  showCollisions: true,
};

type EngineDefinitionProps = { [P in keyof Matter.IEngineDefinition]?: Frozen<NonNullable<Matter.IEngineDefinition[P]>>; }
type RenderDebugDefinition = Omit<Matter.IRenderDefinition, | 'engine'> & { options: typeof defaultRenderOptions; classList: string[] };

interface Props extends EngineDefinitionProps {
  children?: ReactNode;
  events?: { [P in EventName]?: EventCallback };
  renderDebug: boolean | Frozen<RenderDebugDefinition>;
}

export const EngineContext = createContext(undefined as Matter.Engine | undefined);
EngineContext.displayName = 'World.Engine';

export const World = ({ children, events = {}, renderDebug = false, ...definition }: Props): ReactElement => {
  const renderer = useRenderer();
  const ticker = useTicker();
  const engine = useCloseable(() => {
    const engine = Matter.Engine.create(definition);
    // Matter.Engine.run(engine);
    ticker.each(delta => Matter.Engine.update(engine, delta));
    return engine;
  }, engine => Matter.Engine.clear(engine));

  eventNames.forEach(name => useEffect(() => {
    const callback = events[name];
    if (callback == null) return;
    Matter.Events.on(engine, name, callback);
    return () => Matter.Events.off(engine, name, callback);
  }, [events[name]]));

  // render debug canvas.
  useEffect(() => {
    if (!renderDebug) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { classList = ['UI'], ...renderDefinition } = renderDebug === true ? {} as RenderDebugDefinition : renderDebug;
    const renderOptions = {
      width: renderer.width,
      height: renderer.height,
      ...defaultRenderOptions,
      ...renderDefinition.options,
    };

    const [canvas, style] = renderDefinition.canvas ? [renderDefinition.canvas] as const : (() => {
      if (renderer.view.parentNode == null) return [];
      const canvas = document.createElement('canvas');
      canvas.id = 'debugRenderer';
      renderer.view.parentNode.appendChild(canvas);

      const style = canvas.style;
      // prevent `Matter` change the canvas style
      Object.defineProperty(canvas, 'style', { get() { return {}; } });
      return [canvas, style] as const;
    })();

    const render = Matter.Render.create({ ...renderDefinition, canvas, engine, options: renderOptions });
    canvas.classList.add(...classList);
    Matter.Render.run(render);
    if (style == null) return;

    const updateStyle = (): void => {
      const { clientWidth, clientHeight, offsetLeft, offsetTop } = renderer.view;
      style.width = `${clientWidth}px`;
      style.height = `${clientHeight}px`;
      style.left = `${offsetLeft}px`;
      style.top = `${offsetTop}px`;
    };
    const sub = fromResize(renderer.view)
      .pipe(debounceTime(100))
      .subscribe(_ => updateStyle());
    updateStyle();
    return () => sub.unsubscribe();
  }, [engine]);

  return (
    <EngineContext.Provider value={engine}>
      <CompositeContext.Provider value={engine.world}>
        {children}
      </CompositeContext.Provider>
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

type CollisionEventName = | 'collisionStart' | 'collisionActive' | 'collisionEnd';
const useEvent: {
  (name: Exclude<EventName, CollisionEventName>, callback: EventCallback): void;
  (name: CollisionEventName, callback: (event: { name: string; source: Matter.Body } & { pairs: Matter.IPair[] }) => void): void;
} = (name: unknown, callback: unknown) => {
  const engine = useEngine();
  useEffect(() => {
    Matter.Events.on(engine, name as EventName, callback as EventCallback);
    return () => Matter.Events.off(engine, name as EventName, callback as EventCallback);
  }, [engine]);
};
World.useEvent = useEvent;
