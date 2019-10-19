import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useCloseableAsync } from '@fure/view';
import { LocationParams } from '../Home';

/**
 * @typedef {keyof typeof scenes} SceneId .
 */

export const scenes = {
  StageAndUI: {
    displayText: 'Stage & UI',
    get component() { return import('./StageAndUI').then(mod => mod.default); },
  },
  TextureAndSprite: {
    displayText: 'Texture & Sprite',
    get component() { return import('./TextureAndSprite').then(mod => mod.default); },
  },
  HighFrequency: {
    displayText: 'High Frequency',
    get component() { return import('./HighFrequency').then(mod => mod.default); },
  },
  PreloadResource: {
    displayText: 'Preload Resource',
    get component() { return import('./PreloadResource').then(mod => mod.default); },
  },
  LogicDecoupling: {
    displayText: 'Logic Decoupling',
    get component() { return import('./LogicDecoupling').then(mod => mod.default); },
  },
  Physics: {
    displayText: 'Physics',
    get component() { return import('./Physics').then(mod => mod.default); },
  },
  Configuration: {
    displayText: 'Configuration',
    get component() { return import('./Configuration').then(mod => mod.default); },
  },
};

export const Scene = props => {
  const history = useHistory();
  const params: LocationParams = useParams();

  const Component = useCloseableAsync(() => scenes[params.scene].component, _Component => { });
  return (
    <>
      {Component && <Component {...props}></Component>}
      <div id="back" onClick={() => history.goBack()}>BACK</div>
    </>
  );
};
