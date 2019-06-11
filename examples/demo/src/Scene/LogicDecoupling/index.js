import './index.css';
import { LogicDecoupling as core } from '../../main/core';
import { useEffect, useState } from 'react';

export const LogicDecoupling = () => {
  const [level, _setLevel] = useState(1);

  useEffect(() => {
    core.events.start(level);
    return () => core.events.stop();
  }, [level]);

  return (null);
};
LogicDecoupling.displayName = 'LogicDecoupling';
LogicDecoupling.displayText = 'Logic Decoupling';
export default LogicDecoupling;
