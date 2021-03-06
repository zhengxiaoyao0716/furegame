import { ForwardRefExoticComponent, Ref, RefAttributes, forwardRef, useEffect, useMemo } from 'react';
import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';
import './set-poly-decomp'; // `Matter.Bodies.fromVertices` dependence `poly-decomp` to decomposed concave vertices.
import { useSprite } from '../Sprite';
import { useTicker } from '../Ticker';
import { setRef } from '../UI/View';
import { useComposite } from './Composite';

const eventNames = ['sleepStart', 'sleepEnd'] as const;
type EventName = typeof eventNames[number];
type EventCallback = (event: { name: string; source: Matter.Body } & Record<| string | number | symbol, unknown>) => void;

interface Props extends Partial<Pick<Matter.Body, | 'isSleeping' | 'isStatic' | 'isSensor'>> {
  useBody: () => Matter.Body;
  events: { [P in EventName]?: EventCallback };
}

const BodyComponent = ({
  useBody, events = {},
  isSleeping, isStatic,
  isSensor,
}: Props, ref: Ref<Matter.Body>): null => {
  const body = useBody();
  const composite = useComposite();
  useEffect(() => {
    Matter.Composite.add(composite, body);
    setRef(ref, body);
    return () => { Matter.Composite.remove(composite, body); };
  }, []);

  if (isSleeping != null && isSleeping != body.isSleeping) Matter.Sleeping.set(body, isSleeping);
  if (isStatic != null && isStatic != body.isStatic) Matter.Body.setStatic(body, isStatic);
  if (isSensor != null && isSensor != body.isSensor) body.isSensor = isSensor;

  eventNames.forEach(name => useEffect(() => {
    const callback = events[name];
    if (callback == null) return;
    Matter.Events.on(body, name, callback);
    return () => Matter.Events.off(body, name, callback);
  }, [events[name]]));

  return null;
};
BodyComponent.displayName = 'Body';

type UseBodyProps = Pick<Props, 'useBody'>;
const SpriteBody = (newBody: (sprite: PIXI.Sprite) => Matter.Body): UseBodyProps => ({
  useBody: () => {
    const sprite = useSprite();
    const body = useMemo(() => {
      if (sprite == null) throw new Error('`Sprite` context not found for create `Physics.Body`');
      return newBody(sprite);
    }, [sprite]);

    const ticker = useTicker();
    useEffect(() => {
      if (body.isStatic) return;
      Matter.Body.setVelocity(body, body.velocity);
      const sub = ticker.each(_delta => {
        // if (body.id === 100) console.log(body.velocity);
        sprite.rotation = body.angle;
        sprite.position.x = body.position.x;
        sprite.position.y = body.position.y;
      });
      return () => sub.unsubscribe();
    }, [body.isStatic]);
    return body;
  },
});

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BodyDefinition extends Omit<Matter.IBodyDefinition, | 'speed'> {
  /** `speed` would be calculated by `velocity`, so never set it manually. */
}
const SpriteCircle = (options?: BodyDefinition): UseBodyProps => SpriteBody(({ x, y, width }): Matter.Body => Matter.Bodies.circle(x, y, width / 2, options));
const SpriteRectangle = (options?: BodyDefinition): UseBodyProps => SpriteBody(({ x, y, width, height }): Matter.Body => Matter.Bodies.rectangle(x, y, width, height, options));
const SpritePath = (points: (sprite: PIXI.Sprite) => [number, number][], options?: BodyDefinition): UseBodyProps => {
  const newBody = (sprite: PIXI.Sprite): Matter.Body => {
    const vertices = [points(sprite).map(([x, y]) => Matter.Vector.create(x, y))];
    return Matter.Bodies.fromVertices(sprite.x, sprite.y, vertices, options);
  };
  return SpriteBody(newBody);
};
const SpriteTriangle = (options?: BodyDefinition): UseBodyProps => SpritePath(({ width, height }) => [[width / 2, 0], [0, height], [width, height]], options);

export const Body = forwardRef(BodyComponent) as ForwardRefExoticComponent<Props & RefAttributes<Matter.Body>> & {
  Sprite: typeof SpriteBody;
  SpriteCircle: typeof SpriteCircle;
  SpriteRectangle: typeof SpriteRectangle;
  SpritePath: typeof SpritePath;
  SpriteTriangle: typeof SpriteTriangle;
  nextCategory: typeof Matter.Body.nextCategory;
  nextGroup: typeof Matter.Body.nextGroup;
};
Body.Sprite = SpriteBody;
Body.SpriteCircle = SpriteCircle;
Body.SpriteRectangle = SpriteRectangle;
Body.SpritePath = SpritePath;
Body.SpriteTriangle = SpriteTriangle;
Body.nextCategory = Matter.Body.nextCategory;
Body.nextGroup = Matter.Body.nextGroup;
