import React, { ForwardRefExoticComponent, MutableRefObject, ReactElement, ReactNode, Ref, RefAttributes, createContext, forwardRef, useContext } from 'react';
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
export const createSprite = <P extends SpriteProps, S extends PIXI.Sprite>(
  displayName: string,
  supplier: (props: P) => S,
  update: (sprite: S, props: P) => void,
): ForwardRefExoticComponent<P & RefAttributes<PIXI.Sprite>> => {
  const Sprite = (props: P, ref: Ref<PIXI.Sprite>): ReactElement => {
    const container = useContainer();
    const setRef = ref ? (sprite: PIXI.Sprite | null) => {
      if ('current' in ref) (ref as MutableRefObject<PIXI.Sprite | null>).current = sprite;
      else if (ref instanceof Function) ref(sprite);
    } : () => { };
    const sprite = useCloseable(() => {
      const sprite = supplier(props);
      container.addChild(sprite);
      setRef(sprite);
      return sprite;
    }, sprite => {
      setRef(null);
      container.removeChild(sprite);
      sprite.destroy();
    });

    update(sprite, props);

    const {
      children,
      texture,
      position,
      scale,
      anchor = { x: 0.5, y: 0.5 },
      rotation,
      tint = 0xFFFFFF,
      blendMode,
    } = props;
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
        else if ('radian' in rotation && rotation.radian !== sprite.rotation) sprite.rotation = rotation.radian;
      }
      if (tint !== sprite.tint) sprite.tint = tint;
      if (blendMode != null && blendMode !== sprite.blendMode) sprite.blendMode = blendMode;
    }, [texture, position, scale, anchor, rotation]);

    return <SpriteContext.Provider value={sprite}>{children}</SpriteContext.Provider>;
  };
  Sprite.displayName = displayName;
  return forwardRef(Sprite) as ForwardRefExoticComponent<P & RefAttributes<PIXI.Sprite>>;
};

export const Sprite = createSprite('Sprite', ({ texture }: SpriteProps) => new PIXI.Sprite(texture), (_sprite, _props) => { });
