import React, { ReactElement, createContext, useContext } from 'react';
import * as PIXI from 'pixi.js';
import { useContainer } from '../Container';
import { Frozen, useCloseable, useUpdate } from '../hooks';
import { SpriteProps, withSprite } from './Sprite';

export interface AnimatedSpriteProps extends SpriteProps {
  texture?: undefined; // disabled the `texture` field.
  textures: PIXI.Texture[] | PIXI.AnimatedSprite.FrameObject[];
  autoUpdate?: Frozen<boolean>;
  playing?: boolean;
  loop?: boolean;
  animationSpeed?: number;
}

export const AnimatedSpriteContext = createContext(undefined as PIXI.AnimatedSprite | undefined);
AnimatedSpriteContext.displayName = 'AnimatedSprite';
export const useSprite = (): PIXI.Sprite => useContext(AnimatedSpriteContext) as PIXI.Sprite;

export const AnimatedSprite = ({
  textures,
  autoUpdate,
  playing = true,
  loop = true,
  animationSpeed = 1,
  children,
  ...props
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
    if (textures !== sprite.textures) (sprite.textures as AnimatedSpriteProps['textures']) = textures;
    if (playing !== sprite.playing) playing ? sprite.play() : sprite.stop();
    if (loop !== sprite.loop) sprite.loop = loop;
    if (animationSpeed !== sprite.animationSpeed) sprite.animationSpeed = animationSpeed;
  }, [textures, playing, loop, animationSpeed]);

  return withSprite(sprite, {
    ...props, children: (
      <AnimatedSpriteContext.Provider value={sprite}>{children}</AnimatedSpriteContext.Provider>
    ),
  });
};
