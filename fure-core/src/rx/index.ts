/** rxjs extends */

import { Observable, OperatorFunction } from 'rxjs';
import { filter, pluck } from 'rxjs/operators';


type NonUndefined<T> = T extends undefined ? never : T;

export const pick = <T, K extends keyof T>(key: K): OperatorFunction<T, NonUndefined<T[K]>> => {
  return source => source.pipe(pluck(key), filter(value => value !== undefined)) as Observable<NonUndefined<T[K]>>;
};
