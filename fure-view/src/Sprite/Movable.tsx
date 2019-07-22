import React, { ReactElement } from 'react';
import * as PIXI from 'pixi.js';
import { AnimatedSprite, AnimatedSpriteProps } from '.';
import { Subscribe, SubscribeProps } from '../Ticker';
import { AnimatedSpriteContext } from './Animated';

type ProtoExntends<T, U> = U & { [P in Exclude<keyof T, keyof U>]: T[P]; };

interface MovableSpritePropsExtends {
  animId: string | ((vx: number, vy: number) => string);
  textures: { [animId: string]: PIXI.Texture[] };
  position?: undefined;
  source: SubscribeProps<[[number, number], [number, number]]>['source'];
}
export type MovableSpriteProps = ProtoExntends<AnimatedSpriteProps, MovableSpritePropsExtends>;

export const MovableSprite = ({ animId, textures, source, children, ...props }: MovableSpriteProps): ReactElement => {
  const id = animId instanceof Function ? animId(0, 0) : animId;
  return AnimatedSprite({
    ...props, textures: textures[id],
    children: (
      <>
        {children}
        <AnimatedSpriteContext.Consumer>{sprite => (
          sprite && <Subscribe source={source} update={([[x, y], [vx, vy]]) => {
            sprite.position.x = x;
            sprite.position.y = y;
            const id = animId instanceof Function ? animId(vx, vy) : animId;
            if (textures[id] === sprite.textures) return;
            const playing = sprite.playing;
            sprite.textures = textures[id];
            playing && sprite.play();
          }} />
        )}</AnimatedSpriteContext.Consumer>
      </>
    ),
  });
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
