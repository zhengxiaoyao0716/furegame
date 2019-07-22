import React, { ReactElement, ReactNode, createContext, useContext } from 'react';
import * as PIXI from 'pixi.js';
import { useContainer } from '../Container';
import { useCloseable, useUpdate } from '../hooks';

type Degree = number;
type Radian = number;
export interface SpriteProps {
  children?: ReactNode;
  texture?: PIXI.Texture;
  position?: { x: number; y: number };
  scale?: { x: number; y: number } | number;
  anchor?: { x: number; y: number };
  rotation?: { degree: Degree } | { radian: Radian };
  tint?: number;
  blendMode?: PIXI.BLEND_MODES;
}

export const SpriteContext = createContext(undefined as PIXI.Sprite | undefined);
SpriteContext.displayName = 'Sprite';
export const useSprite = (): PIXI.Sprite => useContext(SpriteContext) as PIXI.Sprite;

// should only usage in `Sprite` package, DO NOT export to others.
export const withSprite = (sprite: PIXI.Sprite, {
  children,
  texture,
  position,
  scale,
  anchor = { x: 0.5, y: 0.5 },
  rotation,
  tint = 0xFFFFFF,
  blendMode,
}: SpriteProps): ReactElement => {
  useUpdate(() => {
    if (texture != null && texture !== sprite.texture) sprite.texture = texture;
    if (position && position !== sprite.position) sprite.position.set(position.x, position.y);
    if (scale != null) {
      const { x, y } = scale instanceof Object ? scale : { x: scale, y: scale };
      if (x !== sprite.scale.x) sprite.scale.x = x;
      if (y !== sprite.scale.y) sprite.scale.y = y;
    }
    if (anchor) {
      if (anchor.x !== sprite.anchor.x) sprite.anchor.x = anchor.x;
      if (anchor.y !== sprite.anchor.y) sprite.anchor.y = anchor.y;
    }
    if (rotation) {
      if ('degree' in rotation && rotation.degree !== sprite.angle) sprite.angle = rotation.degree;
      if ('radian' in rotation && rotation.radian !== sprite.rotation) sprite.rotation = rotation.radian;
    }
    if (tint !== sprite.tint) sprite.tint = tint;
    if (blendMode != null && blendMode !== sprite.blendMode) sprite.blendMode = blendMode;
  }, [texture, position, scale, anchor, rotation]);

  return <SpriteContext.Provider value={sprite}>{children}</SpriteContext.Provider>;
};

export const Sprite = (props: SpriteProps): ReactElement => {
  const container = useContainer();
  const sprite = useCloseable(() => {
    const sprite = new PIXI.Sprite(props.texture);
    container.addChild(sprite);
    return sprite;
  }, sprite => {
    container.removeChild(sprite);
    sprite.destroy();
  });

  return withSprite(sprite, props);
};
