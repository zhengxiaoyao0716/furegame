import React, { useState } from 'react';
import { AnimatedSprite, Renderer, RendererOptions, Sprite, Stage, THColors, Texture, UI } from 'fure-view';
import { useSelect } from '../helper';

const options: RendererOptions = { width: 1920, height: 1080, backgroundColor: 0x66ccff };
const randomPosition = () => ({
  x: (0.2 + 0.6 * Math.random()) * options.width,
  y: (0.2 + 0.6 * Math.random()) * options.height,
});

const usages = {
  Simple() {
    return (Object.entries(THColors).map(([name, { data }]) => (
      <Sprite key={name} texture={Texture.from(data)} scale={{ x: 3, y: 3 }} position={randomPosition()} >
        <Stage.LazyRefresh />
      </Sprite>
    )));
  },
  Animated() {
    // Stage.TickRefresh(); // `Stage.XxxRefresh` could usage as react-hook too.
    return (
      <AnimatedSprite textures={Object.values(THColors).map(({ data }) => Texture.from(data))} scale={{ x: 10, y: 10 }} animationSpeed={0.1} position={randomPosition()} >
        <Stage.TickRefresh />
      </AnimatedSprite>
    );
  },
};

const TextureAndSprite = () => {
  const [usage, usageSelector] = useSelect('Simple');
  const Usage = usages[usage];
  return (
    <Renderer {...Renderer.Creator(options)}>
      <Stage>
        <UI id="helper">
          <p {...usageSelector('Simple')}>Simple Usage</p>
          <p {...usageSelector('Animated')}>Animated Usage</p>
        </UI>
        <Usage />
      </Stage>
    </Renderer>
  );
};
TextureAndSprite.displayName = 'TextureAndSprite';
TextureAndSprite.displayText = 'Texture & Sprite';
export default TextureAndSprite;
