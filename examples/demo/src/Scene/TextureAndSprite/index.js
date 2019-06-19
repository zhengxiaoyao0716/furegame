import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { AnimatedSprite, BLEND_MODES, Container, Gradient, MovableSprite, Renderer, RendererOptions, Sprite, Stage, THColors, UI, makeResource, useCloseable, useObservable, usePlayTime } from '@fure/view';
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
    const subject = useMemo(() => timer(0, 1000).pipe(map(index => playerPath[index % playerPath.length])), []);
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
  Particle() {
    const texture = useCloseable(
      () => makeResource.shape({ fill: { color: 0xffffff } }).star(5, 12, 6)('particle'),
      texture => texture.destroy(),
    );
    Stage.TickRefresh();

    const playTime = usePlayTime();
    const birth = useMemo(() => ({ x: options.width / 2, y: options.height / 2 }), []);
    const size = 1000; // lived particles number.
    const period = 4; // send particles interval. [NOTICE: period >= 4ms](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout#Reasons_for_delays_longer_than_specified)
    const speed = 0.2; // particle move speed, 1000px/s.
    // distanceMax = size * period * speed

    const particles = useMemo(() => [], []);
    useEffect(() => {
      const emitter = timer(0, period).pipe(map(() => Math.random() * 2 * Math.PI))
        .pipe(map(angle => ({
          cos: Math.cos(angle),
          sin: Math.sin(angle),
          scale: 0.5 + Math.random(),
          tint: Math.random() * 0xffffff | 0,
          sendAt: playTime.current,
        })));
      const subcription = emitter.subscribe(particle => {
        particles.unshift(particle);
        if (particles.length > size) particles.pop();
      });
      return () => subcription.unsubscribe();
    }, [particles, playTime]);

    const update = useCallback(index => (sprite) => {
      if (!particles[index]) {
        sprite.visible = false;
        return;
      }
      sprite.visible = true;
      const { cos, sin, scale, tint, sendAt } = particles[index];
      const distance = (playTime.current - sendAt) * speed;
      const position = { x: birth.x + cos * distance, y: birth.y + sin * distance };
      sprite.position.x = position.x;
      sprite.position.y = position.y;
      sprite.scale.x = scale;
      sprite.scale.y = scale;
      sprite.tint = tint;
    }, [birth, particles, playTime]);

    return (
      <Container>{new Array(size).fill().map((_, index) => (
        <Sprite key={index} texture={texture} position={birth} blendMode={BLEND_MODES.ADD}>
          <Sprite.Ticker update={update(index)} />
        </Sprite>
      ))}</Container>
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
          <p {...usageSelector('Particle')}>Particle Usage</p>
        </UI>
        <Usage />
      </Stage>
    </Renderer>
  );
};
TextureAndSprite.displayName = 'TextureAndSprite';
TextureAndSprite.displayText = 'Texture & Sprite';
export default TextureAndSprite;
