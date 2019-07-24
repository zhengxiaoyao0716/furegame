import React, { ForwardRefExoticComponent, MutableRefObject, ReactElement, ReactNode, Ref, RefAttributes, createContext, forwardRef, useContext } from 'react';
import * as PIXI from 'pixi.js';
import { useCloseable } from './hooks';

interface Props {
  children?: ReactNode;
}

export const ContainerContext = createContext(undefined as PIXI.Container | undefined);
ContainerContext.displayName = 'Container';
export const useContainer = (): PIXI.Container => useContext(ContainerContext) as PIXI.Container;

const createContainer = (displayName: string, constructor: new () => PIXI.Container): ForwardRefExoticComponent<Props & RefAttributes<PIXI.Container>> => {
  const Container = ({ children }: Props, ref: Ref<PIXI.Container>): ReactElement => {
    const parent = useContainer();
    const setRef = ref ? (container: PIXI.Container | null) => {
      if ('current' in ref) (ref as MutableRefObject<PIXI.Container | null>).current = container;
      else if (ref instanceof Function) ref(container);
    } : () => { };
    const container = useCloseable(() => {
      const container = new constructor();
      parent && parent.addChild(container);
      setRef(container);
      return container;
    }, container => {
      setRef(null);
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
