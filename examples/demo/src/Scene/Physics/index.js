import React from 'react';
import { App, Body, Sprite, THColors, World, useResource } from '@fure/view';

const options: AppOptions = { width: 1920, height: 1080, backgroundColor: 0x66ccff };

const Physics = () => {
  const resource = useResource({
    Reimu: make => make.shape({ fill: { color: THColors.Reimu.rgb } }).rectangle(200, 100),
    Marisa: make => make.shape({ fill: { color: THColors.Marisa.rgb } }).circle(16),
    Alice: make => make.shape({ fill: { color: THColors.Alice.rgb } }).triangle(16, 20, 8),
  });
  const textures = useResource.query(resource)('texture');
  return (
    <App {...App.Creator(options)}>
      <World element="debug">
        {resource && (<>
          <Sprite texture={textures.Reimu} position={{ x: options.width / 2, y: options.height / 2 }}>
            <Body></Body>
          </Sprite>
        </>)}
      </World>
    </App>
  );
};
Physics.displayName = 'Physics';
Physics.displayText = 'Physics';
export default Physics;
