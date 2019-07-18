import React, { ReactNode, useMemo } from 'react';
import { debounceTime, map } from 'rxjs/operators';
import { App, Loader, Renderer, Stage, TickerController, UI, fromResize, useObservable } from '@fure/view';
import './index.css';
import { useSelect } from '../helper';
import { Ticker } from '@fure/core';

const bodySize = () => ({ width: document.body.clientWidth, height: document.body.clientHeight });

const usages = {
  Simple({ children }: { children: ReactNode }) {
    return (
      // `App` == `Loader` + `Renderer` + `Stage` + `Ticker` + `Stage.TickRefresh`
      <App id="game" {...App.Creator({ width: 1920, height: 1080, backgroundColor: 0x66ccff })}>
        <UI id="hello">
          <h2>HELLO</h2>
          <h1>Fure Game</h1>
          <h3>(simple usage)</h3>
        </UI>
        {children}
      </App>
    );
  },
  Advance({ children }: { children: ReactNode }) {
    const size = useObservable(useMemo(() => fromResize(document.body).pipe(debounceTime(100), map(bodySize)), []), bodySize());
    return (
      <Loader> {/* `Loader` is optional */}
        <div style={{ position: 'absolute', width: '100%', height: '100%', textAlign: 'center' }}>
          <h1>Fill Window</h1><h1>{'&'}</h1><h1>Transparent Background</h1><h1>{'&'}</h1><h1>Scale Mode UI</h1>
        </div>
        <Renderer id="game" {...size} {...Renderer.Creator({ transparent: true })} style={{ backgroundColor: 'rgba(102, 204, 255, 0.933)' }}>
          <Stage>
            <TickerController ticker={new Ticker()} /* `Ticker` is optional */>
              <Stage.TickRefresh />
            </TickerController>
          </Stage>
          <UI id="hello" scaleMode={true}>
            <h2>HELLO</h2>
            <h1>Fure Game</h1>
            <h3>(advance usage)</h3>
          </UI>
          {children}
        </Renderer>
      </Loader>
    );
  },
};

const StageAndUI = () => {
  const [Usage, usageSelector] = useSelect('Simple', usages);
  return (
    <Usage>
      <UI id="helper">
        <p {...usageSelector('Simple')}>Simple Usage</p>
        <p {...usageSelector('Advance')}>Advance Usage</p>
      </UI>
    </Usage>
  );
};
StageAndUI.displayName = 'StageAndUI';
StageAndUI.displayText = 'Stage & UI';
export default StageAndUI;
