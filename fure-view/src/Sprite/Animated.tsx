import * as PIXI from 'pixi.js';
import { Frozen } from '../hooks';
import { SpriteProps, createSprite } from './Sprite';

export interface AnimatedSpriteProps extends Omit<SpriteProps, | 'texture'> { // disabled the `texture` field.
  textures: PIXI.Texture[] | PIXI.AnimatedSprite.FrameObject[];
  autoUpdate?: Frozen<boolean>;
  playing?: boolean;
  loop?: boolean;
  animationSpeed?: number;
}

export const AnimatedSprite = createSprite(
  'AnimatedSprite',
  ({ textures, autoUpdate }: AnimatedSpriteProps) => new PIXI.AnimatedSprite(textures, autoUpdate),
  (sprite, {
    textures,
    playing = true,
    loop = true,
    animationSpeed = 1,
  }) => {
    if (textures !== sprite.textures) (sprite.textures as AnimatedSpriteProps['textures']) = textures;
    if (playing !== sprite.playing) playing ? sprite.play() : sprite.stop();
    if (loop !== sprite.loop) sprite.loop = loop;
    if (animationSpeed !== sprite.animationSpeed) sprite.animationSpeed = animationSpeed;
  });
