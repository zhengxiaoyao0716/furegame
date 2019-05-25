import React from 'react';
import { Link, match } from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import { History, Location } from 'history'; // only used as type.
import './index.css';
import 'fure-view';
import { scenes } from '../Scene';

interface LocationState { } // eslint-disable-line @typescript-eslint/no-empty-interface

interface Props {
  history: History<LocationState>;
  location: Location<LocationState>;
  match: match;
}

// eslint-disable-next-line no-unused-vars
const Home = ({ history: _history, location, match: _match }: Props) => {
  return (
    <div className="Home">
      {scenes.map(Scene => (
        <Link key={Scene.displayName} to={{ ...location, pathname: `/scene/${Scene.displayName}` }}>
          <p>{Scene.displayText}</p>
        </Link>
      ))}
    </div>
  );
};
Home.displayName = 'Home';
export default Home;
