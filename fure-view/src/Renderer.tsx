import React, { ReactElement, ReactNode, createContext, useContext, useMemo } from 'react';
import * as PIXI from 'pixi.js';
import { Frozen, useCloseable, useUpdate } from './hooks';
import { ViewContext, withView } from './UI/View';

interface Props {
  children?: ReactNode;
  create?: Frozen<(view?: HTMLCanvasElement) => PIXI.Renderer>;
  width?: number; height?: number;
}

export const RendererContext = createContext(undefined as PIXI.Renderer | undefined);
RendererContext.displayName = 'Renderer';

export type RendererOptions = ConstructorParameters<typeof PIXI.Renderer>[0];
export const Renderer = withView(
  'Renderer',
  ({ children, create, width, height }: Props): ReactElement => {
    const view = useContext(ViewContext);
    const renderer = useCloseable(() => (create ? create(view) : new PIXI.Renderer({ view: view })));

    useUpdate(() => {
      if (width != null && height != null && (width !== renderer.width || height !== renderer.height)) renderer.resize(width, height);
    }, [width, height]);

    return (<RendererContext.Provider value={renderer}>{children}</RendererContext.Provider>);
  },
  {
    Creator: (options?: RendererOptions) => useMemo(() => ({ create: (view: HTMLCanvasElement) => new PIXI.Renderer({ view, ...options }) }), []),
  }
);

export const useRenderer = (): PIXI.Renderer => useContext(RendererContext) as PIXI.Renderer;

export const useScreen = (): PIXI.Rectangle => {
  const renderer = useContext(RendererContext);
  return (renderer && renderer.screen) as PIXI.Rectangle;
};

export const useView = (): HTMLCanvasElement => {
  const renderer = useContext(RendererContext);
  return (renderer && renderer.view) as HTMLCanvasElement;
};
