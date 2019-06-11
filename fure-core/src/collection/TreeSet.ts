import { Comparator, compareNature } from './compare';

export const binarySearch = <E>(comparator: Comparator<E>, elements: E[], target: E): number => {
  let left = 0;
  let right = elements.length - 1;

  while (left <= right) {
    const middle = (left + right) >> 1;
    const cmp = comparator(elements[middle], target);
    if (cmp < 0) {
      left = middle + 1;
    } else if (cmp > 0) {
      right = middle - 1;
    } else {
      return middle;
    }
  }

  return left;
};

export class TreeSet<E> {
  public elements: Readonly<E>[] = [];
  public comparator: Comparator<E>;

  public constructor(comparator: Comparator<E> = compareNature, elements?: Readonly<E>[]) {
    this.comparator = comparator;
    elements && this.pushAll(elements);
  }

  public get size(): number { return this.elements.length; }
  public get isEmpty(): boolean { return this.elements.length === 0; }
  public get head(): E { return this.elements[0]; }
  public get last(): E { return this.elements[this.size - 1]; }

  /**
   * get and remove the head element
   */
  public top(): E | undefined {
    if (this.isEmpty) return undefined;
    return this.elements.splice(0, 1)[0];
  }

  /**
   * get and remove the last element
   */
  public pop(): E | undefined {
    if (this.isEmpty) return undefined;
    return this.elements.splice(this.size - 1, 1)[0];
  }

  public push(element: Readonly<E>): void {
    const index = binarySearch(this.comparator, this.elements, element);
    this.elements.splice(index, 0, element);
  }
  public pushAll(elements: Readonly<E>[]): void {
    elements.forEach(element => this.push(element));
  }
}
