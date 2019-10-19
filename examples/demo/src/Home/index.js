import React from 'react';
import { Link, match } from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import { History, Location } from 'history'; // only used as type.
import './index.css';
import '@fure/view';
import { SceneId, scenes } from '../Scene';
import { PUBLIC_URL } from '..';

export interface LocationState { } // eslint-disable-line @typescript-eslint/no-empty-interface
export interface LocationParams {
  scene: SceneId;
}

interface Props {
  history: History<LocationState>;
  location: Location<LocationState>;
  match: match<LocationParams>;
}

// eslint-disable-next-line no-unused-vars
const Home = ({ history: _history, location, match: _match }: Props) => {
  return (
    <div className="Home">
      {Object.entries(scenes).map(([sceneId, { displayText = sceneId }]) => (
        <Link key={sceneId} to={{ ...location, pathname: `${PUBLIC_URL}/scene/${sceneId}` }}>
          <p>{displayText}</p>
        </Link>
      ))}
    </div>
  );
};
Home.displayName = 'Home';
export default Home;
