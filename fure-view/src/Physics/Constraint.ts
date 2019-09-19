import * as Matter from 'matter-js';
import { useWorld } from './World';
import { Frozen, useCloseableAsync } from '../hooks';
import { MutableRefObject, useMemo } from 'react';

interface PromiseRef<T> extends PromiseLike<T>, MutableRefObject<T | null> { }

type Props = {
  [P in keyof Matter.IConstraintDefinition]?: PromiseRef<NonNullable<Matter.IConstraintDefinition[P]>> | Matter.IConstraintDefinition[P];
};

export const Constraint = (props: Frozen<Props>): null => {
  const world = useWorld();
  useCloseableAsync(async closeRef => {
    const options: Matter.IConstraintDefinition = {};
    const tasks = Object.entries(props).map(async ([key, promise]) => {
      if (promise == null) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (options as any)[key] = await promise;
    });
    await Promise.all(tasks);
    const constraint = Matter.Constraint.create(options);
    closeRef.current || Matter.World.add(world, constraint);
    return constraint;
  }, constraint => Matter.World.remove(world, constraint));
  return null;
};

Constraint.useRefs = <K extends keyof Matter.IConstraintDefinition>(keys: K[]): { [P in K]: PromiseRef<NonNullable<Matter.IConstraintDefinition[P]>> } => {
  const promiseRefs = useMemo(() => {
    type V = NonNullable<Matter.IConstraintDefinition[K]>;
    const newPromiseRef = (): PromiseRef<V> => {
      let value: V | null = null;
      let setValue: (value: V | PromiseLike<V>) => void;
      const promise = new Promise<V>(resolve => setValue = resolve);
      return {
        set current(instance) {
          value = instance;
          instance == null || setValue(instance);
        },
        get current() { return value; },
        then: promise.then.bind(promise),
      };
    };
    return keys.reduce(
      (acc, key) => {
        acc[key] = newPromiseRef() as unknown as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        return acc;
      },
      {} as { [P in K]: PromiseRef<NonNullable<Matter.IConstraintDefinition[P]>> }
    );
  }, []);
  return promiseRefs;
};
