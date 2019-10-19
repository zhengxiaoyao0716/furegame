import React, { MutableRefObject, ReactElement, useMemo, useRef } from 'react';
import { App, FreeMoveSprite, Gradient, MovableSprite, Progress, Subscribe, THColors, Texture, UI, useResource, useSubscribe, useTicker } from '@fure/view';
import { of } from 'rxjs';
import { delay, map, mergeMap, sampleTime, startWith, take } from 'rxjs/operators';
import { useSelect } from '../helper';

const Loading = ({ progress, resource }: IndicatorProps) => {
  const ref: MutableRefObject<HTMLDivElement> = useRef();
  return (
    <UI>
      <Gradient.Simple state={progress}>{pipe =>
        <div ref={ref} style={{ position: 'absolute', width: '1%', height: 6, left: 0, bottom: '6%', background: THColors.Reimu.hex }}>
          <Subscribe source={pipe} update={state => ref.current.style.width = `${state}%`} />
        </div>
      }</Gradient.Simple>
      <small style={{ position: 'absolute', right: '1em', bottom: '6%' }}>{progress.toFixed(2)}% | {resource ? resource.name : 'waiting'} {resource && resource.error && 'failed'}</small>
    </UI>
  );
};

const size = {
  get width() { return document.body.clientWidth; },
  get height() { return document.body.clientHeight; },
};
const useShooter = (time: number, turn: number) => {
  const ticker = useTicker(); // TODO 好像有误差？能感觉到位置闪烁
  return useMemo(
    () => ticker.pipe(sampleTime(time * 1000), startWith(0))
      .pipe(mergeMap(_ =>
        ticker.pipe(sampleTime(time * 1000 / turn), startWith(0), map((_, i) => i))
          .pipe(take(turn))
      ))
      .pipe(map(index => [index * size.width / turn, index])),
    [time, turn, ticker],
  );
};

const copies = (children: (offset: [number, number], index: number) => ReactElement) => {
  return new Array(15).fill().map((_, index) => children([size.width / 2 * ((index / 3 | 0) - 2), size.height / 3 * (index % 3)], index));
};

const Reimu = ({ texture }: { texture: Texture }) => {
  const time = 3;
  const [positionX] = useSubscribe(useShooter(time, 2), [0, 0]);

  const velocityX = size.width / time / 1000; // v = s / t;
  const state = [[positionX, 50], [velocityX]];

  return (
    <Gradient.Velocity state={state}>{pipe => copies(([ox, oy], index) => (
      <MovableSprite key={index} textures={[texture]} scale={{ x: 2, y: 2 }} source={pipe(map(([[x, y]]) => [[x + ox, y + oy]]))} />
    ))}</Gradient.Velocity>
  );
};

const Marisa = ({ texture }: { texture: Texture }) => {
  const time = 3;
  const [positionX] = useSubscribe(useShooter(time, 3), [0, 0]);

  const velocityX = size.width / time / 1000; // v = s / t;
  const velocityY = -400 / 1000;
  const gravityY = 2 * -velocityY / 1000;
  const offsetY = 50; // s = -0.5g * (0.5t)^2
  const state = [[positionX + 200, 150 + offsetY], [velocityX, velocityY], [0, gravityY]];

  return (
    <Gradient.Velocity state={state}>{pipe => copies(([ox, oy], index) => (
      <MovableSprite key={index} textures={[texture]} source={pipe(map(([[x, y]]) => [[x + ox, y + oy]]))} />
    ))}</Gradient.Velocity>
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
  const state = { rotate, frames, distance, direction, position: [positionX + 400, 250] };

  return (
    <Gradient.Circular state={state}>{pipe => copies(([ox, oy], index) => (
      <FreeMoveSprite key={index} textures={[texture]} source={pipe(map(({ x, y, angle }) => ({ position: { x: x + ox, y: y + oy }, rotation: { radian: 0.5 * Math.PI + angle } })))} />
    ))}</Gradient.Circular>
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
export default PreloadResource;
