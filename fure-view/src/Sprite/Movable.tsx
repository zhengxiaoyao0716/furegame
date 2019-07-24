import React, { ReactElement } from 'react';
import * as PIXI from 'pixi.js';
import { AnimatedSprite, AnimatedSpriteProps } from '.';
import { Subscribe, SubscribeProps } from '../Ticker';
import { SpriteContext } from './Sprite';

type ProtoExntends<T, U> = U & { [P in Exclude<keyof T, keyof U>]: T[P]; };

//#region Free direction move

interface FreeMoveSpritePropsExtends {
  position?: undefined;
  rotation?: undefined;
  textures: PIXI.Texture[];
  source: SubscribeProps<Required<Pick<AnimatedSpriteProps, | 'position' | 'rotation'>>>['source'];
}
export type FreeMoveSpriteProps = ProtoExntends<AnimatedSpriteProps, FreeMoveSpritePropsExtends>;

export const FreeMoveSprite = ({ textures, source, children, ...props }: FreeMoveSpriteProps): ReactElement => (
  <AnimatedSprite {...props} textures={textures}>
    {children}
    <SpriteContext.Consumer>{(sprite) => sprite instanceof PIXI.AnimatedSprite && (
      <Subscribe source={source} update={({ position, rotation }) => {
        sprite.position.x = position.x;
        sprite.position.y = position.y;
        if ('degree' in rotation && rotation.degree !== sprite.angle) sprite.angle = rotation.degree;
        else if ('radian' in rotation && rotation.radian !== sprite.rotation) sprite.rotation = rotation.radian;
      }} />
    )}</SpriteContext.Consumer>
  </AnimatedSprite>
);
//#endregion

//#region limited direction move

interface MovableSpritePropsExtends {
  position?: undefined;
  animId?: undefined | string | ((vx: number, vy: number) => string);
  textures: PIXI.Texture[] | { [animId: string]: PIXI.Texture[] };
  source: SubscribeProps<number[][]>['source'];
}
export type MovableSpriteProps = ProtoExntends<AnimatedSpriteProps, MovableSpritePropsExtends>;

export const MovableSprite = ({ animId, textures, source, children, ...props }: MovableSpriteProps): ReactElement => {
  const id = animId instanceof Function ? animId(0, 0) : animId;
  return (
    <AnimatedSprite {...props} textures={id === undefined ? (textures as PIXI.Texture[]) : (textures as Record<string, PIXI.Texture[]>)[id]}>
      {children}
      <SpriteContext.Consumer>{(sprite) => sprite instanceof PIXI.AnimatedSprite && (
        <Subscribe source={source} update={([[x, y], velocity]) => {
          sprite.position.x = x;
          sprite.position.y = y;
          const id = animId instanceof Function ? animId(...velocity as [number, number]) : animId;
          if (id === undefined || (textures as Record<string, PIXI.Texture[]>)[id] === sprite.textures) return;
          const playing = sprite.playing;
          sprite.textures = (textures as Record<string, PIXI.Texture[]>)[id];
          playing && sprite.play();
        }} />
      )}</SpriteContext.Consumer>
    </AnimatedSprite>
  );
};

MovableSprite.UDLR = {
  animId: (vx: number, vy: number) => (vx === 0 ? (vy === 0 ? 'idle' : (vy < 0 ? 'up' : 'down')) : (vx < 0 ? 'left' : 'right')),
};
MovableSprite.toUDLR = (textures: PIXI.Texture[], eachSize = 2) => ({
  idle: textures.slice(0, eachSize),
  up: textures.slice(1 * eachSize, 2 * eachSize),
  down: textures.slice(2 * eachSize, 3 * eachSize),
  left: textures.slice(3 * eachSize, 4 * eachSize),
  right: textures.slice(4 * eachSize, 5 * eachSize),
});
//#endregion
