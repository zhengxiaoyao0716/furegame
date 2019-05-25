import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Redirect, Route, RouteComponentProps } from 'react-router-dom';
import './index.css';
import Home from './Home';
import { scenes } from './Scene';

ReactDOM.render(
  <BrowserRouter>
    <>
      <Route exact path={'/'} /* redirect the root page to `Home` */
        component={({ location }: RouteComponentProps) => (<Redirect to={{ ...location, pathname: `/${Home.displayName}` }} />)} />
      <Route path={`/${Home.displayName}`} component={Home} />

      <Route exact path={'/--start'} /* redirect `start` to first scene */
        component={({ location }: RouteComponentProps) => (<Redirect to={{ ...location, pathname: '/404' }} />)} />

      {scenes.map(Scene => (
        <Route key={Scene.displayName} path={`/scene/${Scene.displayName}`} component={Scene} />
      ))}
    </>
  </BrowserRouter>,
  document.getElementById('root')
);
