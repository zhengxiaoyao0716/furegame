import React, { useEffect } from 'react';
import { App, Stage, useApp } from '@fure/view';
import { Configuration as config } from '../../main/core';
import './index.css';

const Preview = () => {
  const app = useApp();
  useEffect(() => {
    const sub = config.pipe().subscribe(config => {
      app.renderer.backgroundColor = config.background;
    });
    return () => sub.unsubscribe();
  }, []);

  return (
    <>
      <Stage.TickRefresh />
    </>
  );
};

const Editor = () => {
  return (
    <div>
    </div>
  );
};

const Configuration = () => {
  return (
    <div className="Configuration">
      <App><Preview /></App>
      <Editor />
    </div>
  );
};
export default Configuration;
