import React, { ReactElement, ReactNode, createContext, useContext, useMemo } from 'react';
import * as PIXI from 'pixi.js';
import { Frozen, useCloseable, useUpdate } from './hooks';
import { RendererContext } from './Renderer';
import { LoaderContext } from './Loader';
import { StageContext } from './Stage';
import { TickerContext, _patchPIXITicker } from './Ticker';
import { ViewContext, withView } from './UI/View';

interface Props {
  children?: ReactNode;
  create?: Frozen<(view?: HTMLCanvasElement) => PIXI.Application>;
  resizeTo?: Window | HTMLElement;
}

export const AppContext = createContext(undefined as PIXI.Application | undefined);
AppContext.displayName = 'App';

export type AppOptions = ConstructorParameters<typeof PIXI.Application>[0];
export const App = withView(
  'App',
  ({ children, create, resizeTo }: Props): ReactElement => {
    const view = useContext(ViewContext);
    const app = useCloseable(() => {
      const app = create ? create(view) : new PIXI.Application({ view });
      _patchPIXITicker(app.ticker);
      return app;
    });

    useUpdate(() => {
      if (resizeTo != null && resizeTo !== app.resizeTo) {
        app.resizeTo = resizeTo;
        app.resize();
      }
    }, [resizeTo]);

    return (
      <AppContext.Provider value={app}>
        <LoaderContext.Provider value={app.loader}>
          <RendererContext.Provider value={app.renderer}>
            <StageContext.Provider value={app.stage}>
              <TickerContext.Provider value={app.ticker}>
                {children}
              </TickerContext.Provider>
            </StageContext.Provider>
          </RendererContext.Provider>
        </LoaderContext.Provider>
      </AppContext.Provider>
    );
  },
  {
    Creator: (options?: AppOptions) => useMemo(() => ({ create: (view: HTMLCanvasElement) => new PIXI.Application({ view, ...options }) }), []),
  },
);

export const useApp = (): PIXI.Application => useContext(AppContext) as PIXI.Application;
