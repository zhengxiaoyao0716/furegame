import React, { ForwardRefExoticComponent, ReactElement, ReactNode, Ref, RefAttributes, createContext, forwardRef, useContext } from 'react';
import * as PIXI from 'pixi.js';
import { useCloseable } from './hooks';
import { setRef } from './UI/View';

interface Props {
  children?: ReactNode;
}

export const ContainerContext = createContext(undefined as PIXI.Container | undefined);
ContainerContext.displayName = 'Container';
export const useContainer = (): PIXI.Container => useContext(ContainerContext) as PIXI.Container;

const createContainer = (displayName: string, constructor: new () => PIXI.Container): ForwardRefExoticComponent<Props & RefAttributes<PIXI.Container>> => {
  const Container = ({ children }: Props, ref: Ref<PIXI.Container>): ReactElement => {
    const parent = useContainer();
    const container = useCloseable(() => {
      const container = new constructor();
      parent && parent.addChild(container);
      setRef(ref, container);
      return container;
    }, container => {
      setRef(ref, null);
      parent && parent.removeChild(container);
      container.destroy();
    });
    return <ContainerContext.Provider value={container}>{children}</ContainerContext.Provider>;
  };
  Container.displayName = displayName;
  return forwardRef(Container);
};

export const Container = createContainer('Container', PIXI.Container);
export const ParticleContainer = createContainer('Container', PIXI.ParticleContainer);
