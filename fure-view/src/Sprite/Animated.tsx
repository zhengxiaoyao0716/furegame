import React, { ReactElement } from 'react';
import * as PIXI from 'pixi.js';
import { useContainer } from '../Container';
import { Frozen, useCloseable, useUpdate } from '../hooks';
import { SpriteContext, SpriteProps } from './Sprite';

export interface AnimatedSpriteProps extends SpriteProps {
  texture?: undefined; // disabled the `texture` field.
  textures: PIXI.Texture[] | PIXI.AnimatedSprite.FrameObject[];
  autoUpdate?: Frozen<boolean>;
  playing?: boolean;
  loop?: boolean;
  animationSpeed?: number;
}

export const AnimatedSprite = ({
  // super
  children,
  textures,
  position,
  scale,
  anchor = { x: 0.5, y: 0.5 },
  rotation,
  // override
  autoUpdate,
  playing = true,
  loop = true,
  animationSpeed = 1,
  // .
}: AnimatedSpriteProps): ReactElement => {
  const container = useContainer();
  const sprite = useCloseable(() => {
    const sprite = new PIXI.AnimatedSprite(textures, autoUpdate);
    container.addChild(sprite);
    return sprite;
  }, sprite => {
    container.removeChild(sprite);
    sprite.destroy();
  });

  useUpdate(() => {
    // super
    if (textures != null && textures !== sprite.textures) (sprite.textures as typeof textures) = textures;
    if (position && position !== sprite.position) sprite.position.set(position.x, position.y);
    if (scale) {
      if (scale.x !== sprite.scale.x) sprite.scale.x = scale.x;
      if (scale.y !== sprite.scale.y) sprite.scale.y = scale.y;
    }
    if (anchor) {
      if (anchor.x !== sprite.anchor.x) sprite.anchor.x = anchor.x;
      if (anchor.y !== sprite.anchor.y) sprite.anchor.y = anchor.y;
    }
    if (rotation) {
      if ('degree' in rotation && rotation.degree !== sprite.angle) sprite.angle = rotation.degree;
      if ('radian' in rotation && rotation.radian !== sprite.rotation) sprite.rotation = rotation.radian;
    }
    // override
    if (playing !== sprite.playing) playing ? sprite.play() : sprite.stop();
    if (loop !== sprite.loop) sprite.loop = loop;
    if (animationSpeed !== sprite.animationSpeed) sprite.animationSpeed = animationSpeed;
    //.
  }, [textures, position, scale, anchor, rotation, playing, loop, animationSpeed]);

  return <SpriteContext.Provider value={sprite}>{children}</SpriteContext.Provider>;
};
