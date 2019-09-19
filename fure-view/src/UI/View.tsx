import React, { CSSProperties, ComponentType, ForwardRefExoticComponent, MutableRefObject, PropsWithChildren, ReactElement, Ref, RefAttributes, createContext, forwardRef, useCallback, useState } from 'react';
import './View.css';

export function setRef<T>(ref: Ref<T>, value: T): void {
  if (ref == null) return;
  if ('current' in ref) (ref as MutableRefObject<T>).current = value;
  else if (ref instanceof Function) ref(value);
}

export interface ViewProps {
  id?: string; className?: string; style?: CSSProperties;
}

export const ViewContext = createContext(undefined as HTMLCanvasElement | undefined);
ViewContext.displayName = 'View';

const View = ({ id, className = '', style, children }: PropsWithChildren<ViewProps>, ref: Ref<HTMLCanvasElement>): ReactElement => {
  const [view, setView] = useState(undefined as HTMLCanvasElement | undefined);
  const canvasRef = useCallback(canvas => {
    canvas && setView(canvas);
    setRef(ref, canvas);
  }, []);
  return (
    <div id={id} className={`${className && `${className} `}Furegame`} style={style}>
      <canvas ref={canvasRef} />
      {view && (<ViewContext.Provider value={view}>{children}</ViewContext.Provider>)}
    </div>
  );
};

export const withView = <P extends {}, E extends {}>(displayName: string, Component: ComponentType<P>, ext?: E): ForwardRefExoticComponent<ViewProps & P & RefAttributes<HTMLCanvasElement>> & E => {
  Component.displayName = displayName;
  const WithView = ({ id, className, style, ...props }: ViewProps & P, ref: Ref<HTMLCanvasElement>): ReactElement | null => (
    View({ id, className, style, children: <Component {...props as P} /> }, ref)
  );
  WithView.displayName = `${displayName}.View`;
  const WithExt = forwardRef(WithView) as ForwardRefExoticComponent<ViewProps & P & RefAttributes<HTMLCanvasElement>> & E;
  ext && Object.entries(ext).forEach(([name, value]) => {
    WithExt[name as keyof E] = value as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  });
  return WithExt;
};
