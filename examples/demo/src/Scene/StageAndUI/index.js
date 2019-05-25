import React from 'react';
import { Loader, Renderer, Stage, Ticker, UI } from 'fure-view';
import './index.css';

const StageAndUI = () => {
  return (
    // <App {...App.Creator({ width: 1920, height: 1080 })}>
    //   <Stage.TickRefresh />
    //   <UI></UI>
    // </App>
    <Loader>
      <Renderer id="game" {...Renderer.Creator({ width: 1920, height: 1080, backgroundColor: 0x66ccff })}>
        <Stage>
          <Ticker>
            <Stage.TickRefresh />
          </Ticker>
        </Stage>
        <UI id="hello">
          <h2>HELLO</h2>
          <h1>Fure Game</h1>
        </UI>
      </Renderer>
    </Loader>
  );
};
StageAndUI.displayName = 'StageAndUI';
StageAndUI.displayText = 'Stage & UI';
export default StageAndUI;
