import React, { useEffect, useMemo } from 'react';
import { App, Body, Constraint, Sprite, THColors, UI, World, useResource } from '@fure/view';
import { useSelect } from '../helper';

const options: AppOptions = { width: 1920, height: 1080, backgroundColor: 0x66ccff };
const sceneConfig = {
  Reimu: {
    position: { x: 800, y: options.height - 400 },
  },
  Marisa: {
    position: { x: options.width / 2, y: options.height - 500 },
  },
  Alice: {
    position: { x: options.width - 800, y: options.height - 394 },
    anchor: { x: 0.5, y: 0.668 }, // Matter use the gravity center as the anchor
  },
  Cirno: {
    scale: { x: 128, y: 3 },
    position: { x: options.width / 2, y: options.height - 256 },
  },
  Sakuya: {
    scale: { x: 3, y: 32 },
    position: { x: options.width / 2, y: options.height - 128 },
  },
  Youmu: {
    scale: { x: 240, y: 3 },
    position: { x: options.width / 2, y: options.height - 12 },
  },
};

const usages = {
  Catapult() {
    const resource = useResource({
      Reimu: make => make.shape({ fill: { color: THColors.Reimu.rgb } }).rectangle(64, 64),
      Marisa: make => make.shape({ fill: { color: THColors.Marisa.rgb } }).circle(32),
      Alice: make => make.shape({ fill: { color: THColors.Alice.rgb } }).triangle(102.4, 80, 51.2),
    });
    const textures = useResource.query(resource)('texture');

    const catapultRefs = Constraint.useRefs(['bodyA', 'pointB']);
    useEffect(() => {
      catapultRefs.bodyA.then(bodyA => catapultRefs.pointB.current = { ...bodyA.position });
    }, [catapultRefs]);

    const filters = useMemo(() => ({
      negCatapult: { collisionFilter: { group: Body.nextGroup(true) } },
    }), []);

    return (resource && <>
      <Sprite texture={textures.Reimu} {...sceneConfig.Reimu}>
        <Body {...Body.SpriteRectangle()} key />
      </Sprite>
      <Sprite texture={textures.Marisa} {...sceneConfig.Marisa}>
        <Body {...Body.SpriteCircle({ velocity: { y: 10 }, restitution: 1, label: 'Marisa' })} />
      </Sprite>
      <Sprite texture={textures.Alice} {...sceneConfig.Alice}>
        <Body {...Body.SpriteTriangle()} />
      </Sprite>
      <Sprite texture={THColors.Cirno.texture} {...sceneConfig.Cirno}>
        <Body {...Body.SpriteRectangle(filters.negCatapult)} ref={catapultRefs.bodyA} />
      </Sprite>
      <Sprite texture={THColors.Sakuya.texture} {...sceneConfig.Sakuya}>
        <Body {...Body.SpriteRectangle({ isStatic: true, ...filters.negCatapult })} />
      </Sprite>
      <Sprite texture={THColors.Youmu.texture} {...sceneConfig.Youmu}>
        <Body {...Body.SpriteRectangle({ isStatic: true })} />
      </Sprite>
      <Constraint {...catapultRefs} stiffness={1} length={0} />
    </>);
  },
};

const Physics = () => {
  const [Usage, usageSelector] = useSelect('Catapult', usages);
  return (
    <App {...App.Creator(options)}>
      <World element="debug">
        <Usage />
        <World.Mouse />
      </World>
      <UI id="helper">
        <p {...usageSelector('Catapult')}>Catapult</p>
      </UI>
    </App>
  );
};
Physics.displayName = 'Physics';
Physics.displayText = 'Physics';
export default Physics;
