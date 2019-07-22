import React, { ReactElement, Ref, useMemo, useRef } from 'react';
import { App, Gradient, Progress, Sprite, Subscribe, THColors, Texture, UI, useResource, useSubscribe } from '@fure/view';
import { of, timer } from 'rxjs';
import { delay, map, mergeMap, take } from 'rxjs/operators';
import { useSelect } from '../helper';

const Loading = ({ progress, resource }: IndicatorProps) => {
  const ref: Ref<HTMLDivElement> = useRef();
  return (
    <UI>
      <Gradient {...Gradient.Simple(progress)}>{pipe =>
        <div ref={ref} style={{ position: 'absolute', width: '1%', height: 6, left: 0, bottom: '6%', background: THColors.Reimu.hex }}>
          <Subscribe source={pipe} update={state => ref.current.style.width = `${state}%`} />
        </div>
      }</Gradient>
      <small style={{ position: 'absolute', right: '1em', bottom: '6%' }}>{progress.toFixed(2)}% | {resource ? resource.name : 'waiting'} {resource && resource.error && 'failed'}</small>
    </UI>
  );
};

const size = {
  get width() { return document.body.clientWidth; },
  get height() { return document.body.clientHeight; },
};
const useShooter = (time: number, turn: number) => useMemo(
  () => timer(0, time * 1000)
    .pipe(mergeMap(_ =>
      timer(0, time * 1000 / turn)
        .pipe(take(turn))
    ))
    .pipe(map(index => [index * size.width / turn, index])),
  [time, turn],
);

const copies = (x: number, y: number) => (children: (x: number, y: number, index: number) => ReactElement) => {
  return new Array(15).fill().map((_, index) => children(x + size.width / 2 * ((index / 3 | 0) - 2), y + size.height / 3 * (index % 3), index));
};

const Reimu = ({ texture }: { texture: Texture }) => {
  const time = 3;
  const [positionX] = useSubscribe(useShooter(time, 2), [0, 0]);

  const velocityX = size.width / time / 1000; // v = s / t;

  return (
    <Gradient {...Gradient.Velocity([[positionX], [velocityX]])}>{([[x, y = 50]]) => (copies(x, y)((x, y, index) => (
      <Sprite key={index} texture={texture} position={{ x, y }} scale={{ x: 2, y: 2 }} />
    )))}</Gradient>
  );
};

const Marisa = ({ texture }: { texture: Texture }) => {
  const time = 3;
  const [positionX] = useSubscribe(useShooter(time, 3), [0, 0]);

  const velocityX = size.width / time / 1000; // v = s / t;
  const velocityY = -400 / 1000;
  const gravityY = 2 * -velocityY / 1000;
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
  const [positionX, index] = useSubscribe(useShooter(time, turn), [0, 0]);

  const rotate = (index % 2 === 0 ? 1 : -1) / 3 * Math.PI;
  const frames = time * 1000 / turn;
  const distance = size.width / turn;
  const direction = 0;

  return ( // TODO .
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
      marisa: make => make.shape({ fill: { color: THColors.Marisa.rgb } }).star(5, 12, 6), // mock resource usage
      'kagari-nobg-nolight': of({ url: 'https://raw.githubusercontent.com/zhengxiaoyao0716/rewrite-kagali/master/kagali.gif' }).pipe(delay(300)).toPromise(), // async usage with delay
      alice: make => of(make.shape({ fill: { color: THColors.Alice.rgb } }).triangle(16, 20, 8)).pipe(delay(600)).toPromise(), // async and mock resource usage
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
    <App resizeTo={document.body} {...App.Creator({ backgroundColor: 0x66ccff })}>
      <Usage />
    </App>
  );
};
PreloadResource.displayName = 'PreloadResource';
PreloadResource.displayText = 'Preload Resource';
export default PreloadResource;
