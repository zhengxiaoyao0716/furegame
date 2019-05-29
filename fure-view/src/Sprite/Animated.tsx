import React, { ReactElement, ReactNode } from 'react';
import * as PIXI from 'pixi.js';
import { useContainer } from '../Container';
import { Frozen, useCloseable, useUpdate } from '../hooks';
import { SpriteContext } from './Sprite';

export interface AnimatedSpriteProps {
  children?: ReactNode;
  textures: PIXI.Texture[] | PIXI.AnimatedSprite.FrameObject[];
  autoUpdate?: Frozen<boolean>;
  position?: { x: number; y: number };
  playing?: boolean;
  loop?: boolean;
  animationSpeed?: number;
  scale?: { x: number; y: number };
}

export const AnimatedSprite = ({ children, textures, autoUpdate, position, scale, playing = true, loop = true, animationSpeed = 1 }: AnimatedSpriteProps): ReactElement => {
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
    if (textures != null && textures !== sprite.textures) (sprite.textures as typeof textures) = textures;
    if (position && position !== sprite.position) sprite.position.set(position.x, position.y);
    if (playing !== sprite.playing) playing ? sprite.play() : sprite.stop();
    if (scale) {
      if (scale.x !== sprite.scale.x) sprite.scale.x = scale.x;
      if (scale.y !== sprite.scale.y) sprite.scale.y = scale.y;
    }
    if (loop !== sprite.loop) sprite.loop = loop;
    if (animationSpeed !== sprite.animationSpeed) sprite.animationSpeed = animationSpeed;
  }, [textures, position, playing, loop, animationSpeed]);

  return <SpriteContext.Provider value={sprite}>{children}</SpriteContext.Provider>;
};
