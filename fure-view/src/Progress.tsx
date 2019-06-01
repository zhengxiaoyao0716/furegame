import React, { ComponentType, ReactElement, ReactNode, useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';
import { useLoader } from '.';

export interface IndicatorProps {
  progress: number;
  resource?: PIXI.LoaderResource;
}

interface Props {
  completed?: boolean; // if `completed` is true, the `children` would be rendered, else the `indicator` would be rendered.
  indicator?: ComponentType<IndicatorProps>;
  children?: ReactNode;
}

export function Progress({ completed, children, indicator: Indicator }: Props): ReactElement {
  const loader = useLoader();
  const [loaded, setLoaded] = useState(undefined as PIXI.LoaderResource | undefined);
  useEffect(() => {
    const progress = (_loader: PIXI.Loader, resource: PIXI.LoaderResource): void => setLoaded(resource);
    loader.on('progress', progress);
    return () => { loader.removeListener('progress', progress); };
  }, []);

  return (<>{completed ? children : (Indicator == null ? null : <Indicator progress={loader.progress} resource={loaded} />)}</>);
}
