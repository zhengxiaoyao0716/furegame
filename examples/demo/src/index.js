import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Redirect, Route, RouteComponentProps } from 'react-router-dom';
import './index.css';
import Home from './Home';
import { scenes } from './Scene';

export const PUBLIC_URL = process.env.PUBLIC_URL; // eslint-disable-line no-undef

ReactDOM.render(
  <BrowserRouter>
    <>
      <Route exact path={`${PUBLIC_URL}/`} /* redirect the root page to `Home` */
        component={({ location }: RouteComponentProps) => (<Redirect to={{ ...location, pathname: `${PUBLIC_URL}/${Home.displayName}` }} />)} />
      <Route path={`${PUBLIC_URL}/${Home.displayName}`} component={Home} />

      <Route exact path={`${PUBLIC_URL}/--start`} /* redirect `start` to first scene */
        component={({ location }: RouteComponentProps) => (<Redirect to={{ ...location, pathname: `${PUBLIC_URL}/404` }} />)} />

      {scenes.map(Scene => (
        <Route key={Scene.displayName} path={`${PUBLIC_URL}/scene/${Scene.displayName}`} component={Scene} />
      ))}
    </>
  </BrowserRouter>,
  document.getElementById('root')
);
