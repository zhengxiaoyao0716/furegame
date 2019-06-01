import React, { ReactElement, ReactNode, useContext, useMemo } from 'react';
import * as PIXI from 'pixi.js';
import { Frozen, useCloseable } from './hooks';
import { RendererContext } from './Renderer';
import { LoaderContext } from './Loader';
import { StageContext } from './Stage';
import { TickerContext, _patchPIXITicker } from './Ticker';
import { ViewContext, withView } from './UI/View';

interface Props {
  children?: ReactNode;
  create?: Frozen<(view?: HTMLCanvasElement) => PIXI.Application>;
}

export type AppOptions = ConstructorParameters<typeof PIXI.Application>[0];
export const App = withView(
  'App',
  ({ children, create }: Props): ReactElement => {
    const view = useContext(ViewContext);
    const app = useCloseable(() => {
      const app = create ? create(view) : new PIXI.Application({ view });
      _patchPIXITicker(app.ticker);
      return app;
    });
    return (
      <LoaderContext.Provider value={app.loader}>
        <RendererContext.Provider value={app.renderer}>
          <StageContext.Provider value={app.stage}>
            <TickerContext.Provider value={app.ticker}>
              {children}
            </TickerContext.Provider>
          </StageContext.Provider>
        </RendererContext.Provider>
      </LoaderContext.Provider>
    );
  },
  {
    Creator: (options?: AppOptions) => useMemo(() => ({ create: (view: HTMLCanvasElement) => new PIXI.Application({ view, ...options }) }), []),
  },
);
