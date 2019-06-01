import { Observable, fromEvent, fromEventPattern } from 'rxjs';

type ResizeObserver = any; // eslint-disable-line @typescript-eslint/no-explicit-any
type ResizeObserverParams = ConstructorParameters<ResizeObserver>;

export const fromResize = (element: HTMLElement): Observable<Event | ResizeObserverParams> => {
  const ResizeObserver = (window as any).ResizeObserver; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (typeof ResizeObserver === 'undefined') {
    return fromEvent(window, 'resize');
  }
  let observer: InstanceType<ResizeObserver>;
  return fromEventPattern(
    handler => {
      observer = new ResizeObserver(handler);
      observer.observe(element);
    },
    _handler => {
      observer.unobserve(element);
    },
  );
};
