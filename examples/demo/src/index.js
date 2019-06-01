import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import './index.css';
import Home from './Home';
import { scenes } from './Scene';

export const PUBLIC_URL = process.env.PUBLIC_URL; // eslint-disable-line no-undef

ReactDOM.render(
  <BrowserRouter>
    <>
      <Route exact path={`${PUBLIC_URL}/`} component={Home} />

      {scenes.map(Scene => (
        <Route key={Scene.displayName} path={`${PUBLIC_URL}/scene/${Scene.displayName}`} component={Scene} />
      ))}
    </>
  </BrowserRouter>,
  document.getElementById('root')
);
