import React, { ReactNode } from 'react';
import { App, Loader, Renderer, Stage, Ticker, UI } from '@fure/view';
import './index.css';
import { useSelect } from '../helper';

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
    return (
      <Loader> {/* `Loader` is optional */}
        <Renderer id="game" {...Renderer.Creator({ width: 1920, height: 1080, transparent: true })} style={{ backgroundColor: '#6cf' }}>
          <Stage>
            <Ticker> {/* `Ticker` is optional */}
              <Stage.TickRefresh />
            </Ticker>
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
