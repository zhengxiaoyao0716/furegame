import React, { useCallback, useEffect, useMemo } from 'react';
import { range } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { App, AppOptions, BLEND_MODES, Container, Sprite, SpriteContext, Subscribe, makeResource, useCloseable, useTicker } from '@fure/view';

const options: AppOptions = { width: 1920, height: 1080, backgroundColor: 0x66ccff };
const birth = { x: options.width / 2, y: options.height / 2 };
const size = 1000; // lived particles number.
const period = 1; // send particles interval.
const speed = 0.5; // particle move speed, 1000px/s.
// distanceMax = size * period * speed

const Particle = () => {
  const texture = useCloseable(
    () => makeResource.shape({ fill: { color: 0xffffff } }).star(5, 12, 6)('particle'),
    texture => texture.destroy(),
  );

  const ticker = useTicker();

  //#region particles shooter
  const particles: { cos: number; sin: number; scale: number; tint: number; sendAt: number }[] = useMemo(() => [], []);
  useEffect(() => {
    const emitter = ticker.pipe(map(_delta => ticker.runTime))
      .pipe(mergeMap(now => {
        const last = particles[0] ? particles[0].sendAt : now - period;
        const count = Math.floor((now - last) / period);
        return range(1, count).pipe(map(index => {
          const angle = Math.random() * 2 * Math.PI;
          return ({
            cos: Math.cos(angle),
            sin: Math.sin(angle),
            scale: 0.5 + Math.random(),
            tint: Math.random() * 0xffffff | 0,
            sendAt: last + (1 + index) * period,
          });
        }));
      }));
    const subcription = emitter.subscribe(particle => {
      particles.unshift(particle);
      if (particles.length > size) particles.pop();
    });
    return () => subcription.unsubscribe();
  }, [particles, ticker]);
  //#endregion

  // hight frequence update, used only when necessary, for most time, just use `Gradient` to make our code more `reactive`.
  const update = useCallback((index, sprite) => {
    if (!particles[index]) return;
    const { cos, sin, scale, tint, sendAt } = particles[index];
    const distance = (ticker.runTime - sendAt) * speed;
    const position = { x: birth.x + cos * distance, y: birth.y + sin * distance };
    sprite.position.x = position.x;
    sprite.position.y = position.y;
    sprite.scale.x = scale;
    sprite.scale.y = scale;
    sprite.tint = tint;
  }, [particles, ticker]);

  return (
    <Container>{new Array(size).fill().map((_, index) => (
      <Sprite key={index} texture={texture} blendMode={BLEND_MODES.ADD}>
        <SpriteContext.Consumer>{sprite => (
          <Subscribe source={ticker.pipe} update={() => update(index, sprite)} />
        )}</SpriteContext.Consumer>
      </Sprite>
    ))}</Container>
  );
};

const HighFrequency = () => {
  return (
    <App {...App.Creator(options)}>
      <Particle />
    </App>
  );
};
HighFrequency.displayName = 'HighFrequency';
HighFrequency.displayText = 'High Frequency';
export default HighFrequency;
