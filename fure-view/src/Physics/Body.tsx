import React, { ReactElement, ReactNode, createContext, useContext, useEffect, useMemo } from 'react';
import * as Matter from 'matter-js';
import { useSprite } from '../Sprite';
import { useWorld } from './World';

export const Bodies = Matter.Bodies;
export const useSpriteBounds = (): Matter.Body => {
  const sprite = useSprite();
  const body = useMemo(() => {
    if (sprite == null) throw new Error('`Sprite` context not found for create `Physics.Body`');
    const { x, y, width, height } = sprite;
    const body = Bodies.rectangle(x, y, width, height);
    body.position = {
      get x() { return sprite.position.x; },
      get y() { return sprite.position.y; },
      set x(v) { sprite.position.x = v; },
      set y(v) { sprite.position.y = v; },
    };
    return body;
  }, [sprite]);

  return body;
};

interface Props {
  children?: ReactNode;
  useBody: typeof useSpriteBounds;
}

export const BodyContext = createContext(undefined as Matter.Body | undefined);
BodyContext.displayName = 'Body';

export const Body = ({ children, useBody = useSpriteBounds }: Props): ReactElement => {
  const body = useBody();
  const world = useWorld();
  useEffect(() => {
    Matter.World.add(world, body);
    return () => { Matter.World.remove(world, body); };
  }, []);
  return (
    <BodyContext.Provider value={body}>
      {children}
    </BodyContext.Provider>
  );
};

export const useBody = (): Matter.Body => useContext(BodyContext) as Matter.Body;
