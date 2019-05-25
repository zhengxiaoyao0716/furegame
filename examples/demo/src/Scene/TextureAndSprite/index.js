import React from 'react';
import { App, AppOptions, Sprite, Stage, THColors, Texture } from 'fure-view';

const options: AppOptions = { width: 1920, height: 1080, backgroundColor: 0x66ccff };
const randomPosition = () => ({
  x: (0.2 + 0.6 * Math.random()) * options.width,
  y: (0.2 + 0.6 * Math.random()) * options.height,
});

const TextureAndSprite = () => (
  <App {...App.Creator(options)}>{Object.entries(THColors).map(([name, thc]) => (
    <Sprite key={name} texture={Texture.from(thc.data)} scale={{ x: 3, y: 3 }} position={randomPosition()}>
      <Stage.LazyRefresh />
    </Sprite>
  ))}</App>
);
TextureAndSprite.displayName = 'TextureAndSprite';
TextureAndSprite.displayText = 'Texture & Sprite';
export default TextureAndSprite;
