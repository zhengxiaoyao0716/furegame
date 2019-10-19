import { useDebugValue, useEffect, useState } from 'react';
import { Observable } from 'rxjs';

export interface SubscribeProps<S> {
  source: Observable<S> | (() => Observable<S>)  | Observable<S>['pipe'];
  update: (state: S) => void;
}

export const Subscribe = <S>({ source, update }: SubscribeProps<S>): null => {
  useEffect(() => {
    const sub = (source instanceof Function ? source() : source).subscribe(update);
    return () => sub.unsubscribe();
  }, [source]);
  return null;
};

export const useSubscribe = <S>(source: SubscribeProps<S>['source'], init?: S, deps = []): S | undefined => {
  const [snapshot, setSnapshot] = useState(() => init);
  useEffect(() => {
    const subcription = (source instanceof Function ? source() : source).subscribe(snapshotNew => setSnapshot(_snapshotOld => snapshotNew));
    return () => subcription.unsubscribe();
  }, deps);
  useDebugValue(snapshot, JSON.stringify);
  return snapshot;
};
