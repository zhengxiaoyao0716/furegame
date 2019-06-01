import React, { useMemo } from 'react';
import { interval } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AnimatedSprite, Gradient, MovableSprite, Renderer, RendererOptions, Sprite, Stage, THColors, UI, makeResource, useCloseable, useObservable } from 'fure-view';
import { playerAnims, playerPath, useSelect } from '../helper';

const options: RendererOptions = { width: 1920, height: 1080, backgroundColor: 0x66ccff };
const randomPosition = () => ({
  x: (0.2 + 0.6 * Math.random()) * options.width,
  y: (0.2 + 0.6 * Math.random()) * options.height,
});

const usages = {
  Simple() {
    return (Object.entries(THColors).map(([name, thc]) => (
      <Sprite key={name} texture={thc.texture} scale={{ x: 3, y: 3 }} position={randomPosition()} >
        <Stage.LazyRefresh />
      </Sprite>
    )));
  },
  Animated() {
    const textures = useCloseable(
      () => [
        ...['あ', 'い', 'う', 'え', 'お'].map(text => makeResource.text(text)(text)),
        ...Object.entries(THColors).map(([name, thc]) => makeResource.shape({ fill: { color: thc.rgb } }).circle(8)(`${name}.circle`)),
        ...Object.entries(THColors).map(([name, thc]) => makeResource.shape({ fill: { color: thc.rgb } }).star(5, 12, 6)(`${name}.star`)),
      ],
      textures => textures.forEach(texture => texture.destroy()),
    );
    Stage.TickRefresh(); // `Stage.XxxRefresh` could usage as react-hook too.
    return (textures.map((_, index) => (
      <AnimatedSprite key={index} textures={[...textures.slice(index), ...textures.slice(0, index)]} animationSpeed={0.1} position={randomPosition()} />
    )));
  },
  Moveable() {
    const subject = useMemo(() => interval(1000).pipe(startWith(-1)).pipe(map((_, index) => playerPath[index % playerPath.length])), []);
    const { position, velocity, gravity } = useObservable(subject, { position: [], velocity: [], gravity: [] });

    const textures = useMemo(() => MovableSprite.toUDLR(playerAnims.map(value => (
      makeResource.text(value, { fontFamily: ['monospace'], fontSize: 24 })())
    )), []);

    return (
      <Gradient {...Gradient.Velocity([position, velocity, gravity])}>{([[x, y], [vx, vy]]) =>
        <MovableSprite {...MovableSprite.UDLR} textures={textures} position={{ x: x + 510, y: y + 90 }} velocity={{ vx, vy }} animationSpeed={0.1}>
          <Stage.LazyRefresh />
        </MovableSprite>
      }</Gradient>
    );
  },
};

const TextureAndSprite = () => {
  const [Usage, usageSelector] = useSelect('Simple', usages);
  return (
    <Renderer {...Renderer.Creator(options)}>
      <Stage>
        <UI id="helper">
          <p {...usageSelector('Simple')}>Simple Usage</p>
          <p {...usageSelector('Animated')}>Animated Usage</p>
          <p {...usageSelector('Moveable')}>Moveable Usage</p>
        </UI>
        <Usage />
      </Stage>
    </Renderer>
  );
};
TextureAndSprite.displayName = 'TextureAndSprite';
TextureAndSprite.displayText = 'Texture & Sprite';
export default TextureAndSprite;
