import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import './index.css';
import Home from './Home';
import { Scene } from './Scene';

export const PUBLIC_URL = process.env.PUBLIC_URL; // eslint-disable-line no-undef

ReactDOM.render(
  <BrowserRouter>
    <>
      <Route exact path={`${PUBLIC_URL}/`} component={Home} />
      <Route path={`${PUBLIC_URL}/scene/:scene`} component={Scene} />
    </>
  </BrowserRouter>,
  document.getElementById('root')
);
