import React, { ReactElement, ReactNode, createContext } from 'react';
import * as PIXI from 'pixi.js';
import { useContainer } from '../Container';
import { useCloseable, useUpdate } from '../hooks';

type Degree = number;
type Radian = number;
export interface SpriteProps {
  children?: ReactNode;
  texture?: PIXI.Texture;
  position?: { x: number; y: number };
  scale?: { x: number; y: number };
  rotation?: { degree: Degree } | { radian: Radian };
  anchor?: { x: number; y: number };
}

export const SpriteContext = createContext(undefined as PIXI.Sprite | undefined);
SpriteContext.displayName = 'Sprite';

export const Sprite = ({
  children,
  texture,
  position,
  scale,
  anchor = { x: 0.5, y: 0.5 },
  rotation,
}: SpriteProps): ReactElement => {
  const container = useContainer();
  const sprite = useCloseable(() => {
    const sprite = new PIXI.Sprite(texture);
    container.addChild(sprite);
    return sprite;
  }, sprite => {
    container.removeChild(sprite);
    sprite.destroy();
  });

  useUpdate(() => {
    if (texture != null && texture !== sprite.texture) sprite.texture = texture;
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
  }, [texture, position, scale, anchor, rotation]);

  return <SpriteContext.Provider value={sprite}>{children}</SpriteContext.Provider>;
};
