import React, { ReactElement, ReactNode, createContext, useContext } from 'react';
import * as PIXI from 'pixi.js';
import { useCloseable } from './hooks';

interface Props {
  children?: ReactNode;
}

export const ContainerContext = createContext(undefined as PIXI.Container | undefined);
ContainerContext.displayName = 'Container';

export const Container = ({ children }: Props): ReactElement => {
  const container = useCloseable(() => new PIXI.Container());
  return <ContainerContext.Provider value={container}>{children}</ContainerContext.Provider>;
};

export const useContainer = (): PIXI.Container => useContext(ContainerContext) as PIXI.Container;
