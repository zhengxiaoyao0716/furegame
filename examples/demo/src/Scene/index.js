import React from 'react';
import { useHistory } from 'react-router-dom';
import StageAndUI from './StageAndUI';
import TextureAndSprite from './TextureAndSprite';
import PreloadResource from './PreloadResource';
import LogicDecoupling from './LogicDecoupling';
import HighFrequency from './HighFrequency';
import Physics from './Physics';

const createScene = Component => {
  const Scene = (props, context) => {
    const history = useHistory();
    return (
      <>
        {Component(props, context)}
        <div id="back" onClick={() => history.goBack()}>BACK</div>
      </>
    );
  };
  Scene.displayName = Component.displayName;
  Scene.displayText = Component.displayText;
  return Scene;
};

export const scenes = [
  StageAndUI,
  TextureAndSprite,
  HighFrequency,
  PreloadResource,
  LogicDecoupling,
  Physics,
].map(createScene);
