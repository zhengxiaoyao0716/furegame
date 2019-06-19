import React, { ReactElement, ReactNode, createContext, useContext } from 'react';
import * as PIXI from 'pixi.js';
import { useCloseable } from './hooks';

interface Props {
  children?: ReactNode;
}

export const ContainerContext = createContext(undefined as PIXI.Container | undefined);
ContainerContext.displayName = 'Container';
export const useContainer = (): PIXI.Container => useContext(ContainerContext) as PIXI.Container;

const withContainer = (container: PIXI.Container, { children }: Props): ReactElement => {
  const parent = useContainer();
  parent && parent.addChild(container);
  return <ContainerContext.Provider value={container}>{children}</ContainerContext.Provider>;
};

export const Container = ({ ...props }: Props): ReactElement => {
  const container = useCloseable(() => new PIXI.Container());
  return withContainer(container, props);
};
Container.Particle = ({ ...props }: Props): ReactElement => {
  const container = useCloseable(() => new PIXI.ParticleContainer());
  return withContainer(container, props);
};
