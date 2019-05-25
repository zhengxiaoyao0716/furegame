import React, { ComponentType, PropsWithChildren, ReactElement, createContext, useCallback, useState } from 'react';
import './View.css';

export interface ViewProps {
  id?: string; className?: string;
}

export const ViewContext = createContext(undefined as HTMLCanvasElement | undefined);
ViewContext.displayName = 'View';

const View = ({ id, className = '', children }: PropsWithChildren<ViewProps>): ReactElement => {
  const [view, setView] = useState(undefined as HTMLCanvasElement | undefined);
  const canvasRef = useCallback(canvas => { canvas && setView(canvas); }, []);
  return (
    <div id={id} className={`${className && `${className} `}Furegame`}>
      <canvas ref={canvasRef} />
      {view && (<ViewContext.Provider value={view}>{children}</ViewContext.Provider>)}
    </div>
  );
};

export const withView = <P extends {}, E extends {}>(displayName: string, Component: ComponentType<P>, ext?: E): ComponentType<ViewProps & P> & E => {
  Component.displayName = displayName;
  const WithView = ({ id, className, ...props }: ViewProps & P): ReactElement | null => (
    View({ id, className, children: <Component {...props as P} /> })
  );
  WithView.displayName = `${displayName}.View`;
  const WithExt = WithView as ComponentType<ViewProps & P> & E;
  ext && Object.entries(ext).forEach(([name, value]) => {
    WithExt[name as keyof E] = value as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  });
  return WithExt;
};
