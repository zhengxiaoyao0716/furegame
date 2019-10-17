export type Comparator<E> = (e1: E, e2: E) => -1 | 0 | 1;

export const compareNature = <E>(): Comparator<E> => <T>(l: T, r: T): | -1 | 0 | 1 => (l < r ? -1 : l === r ? 0 : 1);

export const compareReverse = <E>(compare: Comparator<E> = compareNature()): Comparator<E> => (e1, e2) => compare(e2, e1);

export const compareExtract = <T, E>(mapper: (element: T) => E, compare: Comparator<E> = compareNature()): Comparator<T> => {
  return (target1, target2) => compare(mapper(target1), mapper(target2));
};

export const shuffle = <E>(elements: E[]): E[] => {
  const wrapper = elements.map(element => ({ element, weight: Math.random() }));
  wrapper.sort(compareExtract(({ weight }) => weight));
  return wrapper.map(({ element }) => element);
};
