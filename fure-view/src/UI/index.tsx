import React, { CSSProperties, ReactElement, ReactNode, useMemo } from 'react';
import { debounceTime, map } from 'rxjs/operators';
import * as PIXI from 'pixi.js';
import './index.css';
import { fromResize } from './resize';
import { useRenderer } from '../Renderer';
import { useSubscribe } from '../Ticker';

// export * from './View'; // `View` should auto created by `Render` or `App`, should not exports to developer.

interface Props {
  id?: string; className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /** adapt the canvas by scaling the size instead of cropping it. */
  scaleMode?: boolean;
}

const styleOf = (renderer: PIXI.Renderer, scaleMode = false): CSSProperties => {
  const { clientWidth, clientHeight, offsetLeft, offsetTop } = renderer.view;
  if (!scaleMode) return { width: clientWidth, height: clientHeight, left: offsetLeft, top: offsetTop };
  const { width, height } = renderer;
  return {
    width, height,
    transform: `scale(${clientWidth / width}, ${clientHeight / height})`,
    left: (clientWidth - width) / 2 + offsetLeft, top: (clientHeight - height) / 2 + offsetTop,
  };
};

export const UI = ({ id, className = '', style: outerStyle, children, scaleMode }: Props): ReactElement => {
  const renderer = useRenderer();
  const styleEvent = useMemo(() => (
    fromResize(renderer.view)
      .pipe(debounceTime(100))
      .pipe(map(_ => styleOf(renderer, scaleMode)))
  ), []);
  const builtinStyle = useSubscribe(styleEvent, useMemo(() => styleOf(renderer, scaleMode), []));
  const style = useMemo(() => ({ ...outerStyle, ...builtinStyle }), [outerStyle, builtinStyle]);
  return (
    <div id={id} className={`${className && `${className} `}UI`} style={style}>{children}</div>
  );
};

export { fromResize } from './resize';
