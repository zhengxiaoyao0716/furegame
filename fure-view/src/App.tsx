import React, { ReactElement, ReactNode, createContext, useContext, useMemo } from 'react';
import * as PIXI from 'pixi.js';
import { Frozen, useCloseable } from './hooks';
import { RendererContext } from './Renderer';
import { LoaderContext } from './Loader';
import { Stage, StageContext } from './Stage';
import { TickerController } from './Ticker';
import { ViewContext, withView } from './UI/View';
import { Ticker } from '@fure/core';

type Application = { [P in Exclude<keyof PIXI.Application, 'ticker'>]: PIXI.Application[P] };

interface Props {
  children?: ReactNode;
  create?: Frozen<(view?: HTMLCanvasElement) => PIXI.Application>;
  ticker?: Frozen<Ticker>;
  resizeTo?: Window | HTMLElement;
}

export const AppContext = createContext(undefined as Application | undefined);
AppContext.displayName = 'App';

export type AppOptions = ConstructorParameters<typeof PIXI.Application>[0];
export const App = withView(
  'App',
  ({ children, create, ticker = Ticker.shared, resizeTo }: Props): ReactElement => {
    const view = useContext(ViewContext);
    const app = useCloseable(() => {
      const app = (create ? create(view) : new PIXI.Application({ view })) as PIXI.Application | { ticker: null };
      app.ticker = null;
      return app as Application;
    });

    if (resizeTo != null && resizeTo !== app.resizeTo) {
      app.resizeTo = resizeTo;
      app.resize();
    }

    return (
      <AppContext.Provider value={app}>
        <LoaderContext.Provider value={app.loader}>
          <RendererContext.Provider value={app.renderer}>
            <StageContext.Provider value={app.stage}>
              <TickerController ticker={ticker}>
                {children}
                <Stage.TickRefresh />
              </TickerController>
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

export const useApp = (): Application => useContext(AppContext) as Application;
