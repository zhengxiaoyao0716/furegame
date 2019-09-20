import React, { ReactElement, ReactNode, createContext, useContext, useEffect } from 'react';
import * as Matter from 'matter-js';
import { Frozen, useCloseable } from '../hooks';

const eventNames = [
  'beforeAdd', 'afterAdd',
  'beforeRemove', 'afterRemove',
] as const;
type EventName = typeof eventNames[number];

type CompositeDefinitionProps = { [P in keyof Matter.ICompositeDefinition]?: Frozen<NonNullable<Matter.ICompositeDefinition[P]>> };

interface Props extends CompositeDefinitionProps {
  children?: ReactNode;
  events: { [P in EventName]?: (event: { name: string; source: Matter.Composite } & Record<| string | number | symbol, unknown>) => void };
}

export const CompositeContext = createContext(undefined as Matter.Composite | undefined);
CompositeContext.displayName = 'Composite';

export const useComposite = (): Matter.Composite => useContext(CompositeContext) as Matter.Composite;

export const Composite = ({ children, events, ...definition }: Props): ReactElement => {
  const parent = useComposite();
  const composite = useCloseable(() => {
    const composite = Matter.Composite.create(definition);
    Matter.Composite.add(parent, composite);
    return composite;
  }, composite => Matter.Composite.remove(parent, composite));

  eventNames.forEach(name => useEffect(() => {
    const callback = events[name];
    if (callback == null) return;
    Matter.Events.on(composite, name, callback);
    return () => Matter.Events.off(composite, name, callback);
  }, [events[name]]));

  return (
    <CompositeContext.Provider value={composite}>
      {children}
    </CompositeContext.Provider>
  );
};

Composite.useEvent = (name: EventName, callback: NonNullable<Props['events'][EventName]>) => {
  const composite = useComposite();
  useEffect(() => {
    Matter.Events.on(composite, name, callback);
    return () => Matter.Events.off(composite, name, callback);
  }, [composite]);
};
