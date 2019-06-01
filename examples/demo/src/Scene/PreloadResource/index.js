import React, { ReactElement, useMemo } from 'react';
import { App, Gradient, Progress, Sprite, THColors, Texture, UI, useObservable, useResource, useTicker } from 'fure-view';
import { interval, of } from 'rxjs';
import { delay, map, mergeMap, startWith, take } from 'rxjs/operators';
import { useSelect } from '../helper';

const Loading = ({ progress, resource }: IndicatorProps) => (
  <UI>
    <Gradient {...Gradient.Simple(progress)}>{state =>
      <div style={{ position: 'absolute', width: `${state}%`, height: 6, left: 0, bottom: '6%', background: THColors.Reimu.hex }} />
    }</Gradient>
    <small style={{ position: 'absolute', right: '1em', bottom: '6%' }}>{progress.toFixed(2)}% | {resource ? resource.name : 'waiting'} {resource && resource.error && 'failed'}</small>
  </UI>
);

const width = 2000;
const useShooter = (time: number, turn: number) => useMemo(
  () => interval(time * 1000)
    .pipe(startWith(0))
    .pipe(mergeMap(_ => interval(time * 1000 / turn)
      .pipe(map(i => 1 + i), startWith(0), take(turn))
    ))
    .pipe(map(index => [index * width / turn, index])),
  [time, turn],
);

const copies = (x: number, y: number) => (children: (x: number, y: number, index: number) => ReactElement) => {
  return new Array(15).fill().map((_, index) => children(x + 1000 * ((index / 3 | 0) - 2), y + 360 * (index % 3), index));
};

const Reimu = ({ texture }: { texture: Texture }) => {
  const time = 3;
  const [positionX] = useObservable(useShooter(time, 2), [0, 0]);

  const velocityX = width / time / useTicker().maxFPS; // v = s / t;

  return (
    <Gradient {...Gradient.Velocity([[positionX], [velocityX]])}>{([[x, y = 50]]) => (copies(x, y)((x, y, index) => (
      <Sprite key={index} texture={texture} position={{ x, y }} scale={{ x: 6, y: 6 }} />
    )))}</Gradient>
  );
};

const Marisa = ({ texture }: { texture: Texture }) => {
  const time = 3;
  const [positionX] = useObservable(useShooter(time, 3), [0, 0]);

  const ticker = useTicker();
  const velocityX = width / time / ticker.maxFPS; // v = s / t;
  const velocityY = -400 / ticker.maxFPS;
  const gravityY = 2 * -velocityY / ticker.maxFPS;
  const offsetY = 50; // s = -0.5g * (0.5t)^2

  return (
    <Gradient {...Gradient.Velocity([[positionX + 200, 150 + offsetY], [velocityX, velocityY], [0, gravityY]])}>{([[x, y]]) => (copies(x, y)((x, y, index) => (
      <Sprite key={index} texture={texture} position={{ x, y }} />
    )))}</Gradient>
  );
};

const Alice = ({ texture }: { texture: Texture }) => {
  const time = 3;
  const turn = 6;
  const [positionX, index] = useObservable(useShooter(time, turn), [0, 0]);

  const rotate = (index % 2 === 0 ? 1 : -1) / 3 * Math.PI;
  const frames = time * useTicker().maxFPS / turn;
  const distance = width / turn;
  const direction = 0;

  return (
    <Gradient.Circular rotate={rotate} frames={frames} distance={distance} direction={direction} position={[positionX + 400, 250]}>{({ x, y, angle }) => (copies(x, y)((x, y, index) => (
      <Sprite key={index} texture={texture} position={{ x, y }} rotation={{ radian: 0.5 * Math.PI + angle }} />
    )))}</Gradient.Circular>
  );
};
const Kagari = ({ texture }: { texture: Texture }) => {
  return (
    <img src={texture.baseTexture.resource.url} alt="kagari" style={{ maxWidth: '30%', maxHeight: '60%', position: 'absolute', right: 0, bottom: 0 }} />
  );
};

const usages = {
  Simple() {
    const resource = useResource({
      reimu: { url: THColors.Reimu.data }, // base usage
      kagari: of({ url: 'https://raw.githubusercontent.com/zhengxiaoyao0716/rewrite-kagali/master/kagari-nobg-nolight.gif' }).toPromise(), // async usage
      marisa: make => make.shape({ fill: { color: THColors.Marisa.rgb } }).star(5, 32, 20), // mock resource usage
      'kagari-nobg-nolight': of({ url: 'https://raw.githubusercontent.com/zhengxiaoyao0716/rewrite-kagali/master/kagali.gif' }).pipe(delay(300)).toPromise(), // async usage with delay
      alice: make => of(make.shape({ fill: { color: THColors.Alice.rgb } }).triangle(46, 60, 23)).pipe(delay(600)).toPromise(), // async and mock resource usage
    });
    const textures = useResource.query(resource)('texture');

    return (
      <Progress completed={!!resource} indicator={Loading}>
        <Reimu texture={textures.reimu} />
        <Marisa texture={textures.marisa} />
        <Alice texture={textures.alice} />
        <Kagari texture={textures.kagari} />
      </Progress>
    );
  },
};

const PreloadResource = () => {
  const [Usage] = useSelect('Simple', usages);
  return (
    <App {...App.Creator({ width: 1920, height: 1080, backgroundColor: 0x66ccff })}>
      <Usage />
    </App>
  );
};
PreloadResource.displayName = 'PreloadResource';
PreloadResource.displayText = 'Preload Resource';
export default PreloadResource;
