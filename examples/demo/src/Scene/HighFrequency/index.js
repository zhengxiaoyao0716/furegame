import React, { useCallback, useEffect, useMemo } from 'react';
import { timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { App, AppOptions, BLEND_MODES, Container, Sprite, makeResource, useCloseable, useTicker } from '@fure/view';

const options: AppOptions = { width: 1920, height: 1080, backgroundColor: 0x66ccff };
const birth = { x: options.width / 2, y: options.height / 2 };
const size = 1000; // lived particles number.
const period = 4; // send particles interval. [NOTICE: period >= 4ms](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout#Reasons_for_delays_longer_than_specified)
const speed = 0.2; // particle move speed, 1000px/s.
// distanceMax = size * period * speed

const Particle = () => {
  const texture = useCloseable(
    () => makeResource.shape({ fill: { color: 0xffffff } }).star(5, 12, 6)('particle'),
    texture => texture.destroy(),
  );

  const ticker = useTicker();

  //#region particles shooter
  const particles = useMemo(() => [], []);
  useEffect(() => {
    const emitter = timer(0, period).pipe(map(() => Math.random() * 2 * Math.PI))
      .pipe(map(angle => ({
        cos: Math.cos(angle),
        sin: Math.sin(angle),
        scale: 0.5 + Math.random(),
        tint: Math.random() * 0xffffff | 0,
        sendAt: ticker.runTime,
      })));
    const subcription = emitter.subscribe(particle => {
      particles.unshift(particle);
      if (particles.length > size) particles.pop();
    });
    return () => subcription.unsubscribe();
  }, [particles, ticker]);
  //#endregion

  // hight frequence update, used only when necessary, for most time, just use `Gradient` to make our code more `reactive`.
  const update = useCallback(index => (sprite) => {
    if (!particles[index]) {
      sprite.visible = false;
      return;
    }
    sprite.visible = true;
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
        <Sprite.Ticker update={update(index)} />
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
