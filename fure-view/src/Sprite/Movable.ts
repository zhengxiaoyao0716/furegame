import { AnimatedSprite, AnimatedSpriteProps } from '.';
import * as PIXI from 'pixi.js';
import { ReactElement } from 'react';

type ProtoExntends<T, U> = U & { [P in Exclude<keyof T, keyof U>]: T[P]; };

interface MovableSpritePropsExtends {
  animId: string | ((velocity: { vx: number; vy: number }) => string);
  textures: { [animId: string]: PIXI.Texture[] };
  position: { x: number; y: number };
  velocity: { vx: number; vy: number };
}
export type MovableSpriteProps = ProtoExntends<AnimatedSpriteProps, MovableSpritePropsExtends>;

export const MovableSprite = ({ animId, textures, position, velocity, ...props }: MovableSpriteProps): ReactElement => {
  const id = animId instanceof Function ? animId(velocity) : animId;
  return AnimatedSprite({ textures: textures[id], position, ...props });
};

MovableSprite.UDLR = {
  animId: ({ vx, vy }: MovableSpritePropsExtends['velocity']) => (vx === 0 ? (vy === 0 ? 'idle' : (vy < 0 ? 'up' : 'down')) : (vx < 0 ? 'left' : 'right')),
};
MovableSprite.toUDLR = (textures: PIXI.Texture[], eachSize = 2) => ({
  idle: textures.slice(0, eachSize),
  up: textures.slice(1 * eachSize, 2 * eachSize),
  down: textures.slice(2 * eachSize, 3 * eachSize),
  left: textures.slice(3 * eachSize, 4 * eachSize),
  right: textures.slice(4 * eachSize, 5 * eachSize),
});
