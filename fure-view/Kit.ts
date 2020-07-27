import { Component } from "../fure-core/mod.ts";
import { EventMap as CoreEventMap } from "../fure-core/_util/mod.ts";

export type Nodes = Kit<Props>[];
export interface Props {
  nodes?: Nodes;
}

export interface Setup<P extends Props> {
  name: string;
  (
    this: Kit<P>,
    props: Readonly<P>,
  ):
    | void
    | undefined
    | Kit<Props>
    | Nodes
    | Promise<void | undefined | Kit<Props> | Nodes>;
}

export class Kit<P extends Props> extends Component<EventMap> {
  constructor(
    readonly setup: Setup<P>,
    readonly props: Readonly<P>,
  ) {
    super(setup.name);
  }

  static c = create;
}
export namespace Kit {
  export declare namespace JSX {
    type Element = ReturnType<typeof create>; // WTF
    interface ElementClass extends Kit<Props> {
      readonly setup: Setup<Props>;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      nodes: {};
    }

    interface IntrinsicElements {
      [elemName: string]: never;
    }
  }
}

//

//#region create

// used to flat the nodes tree
export interface Fragment<N extends Nodes> {
  (props: { nodes: N }): N;
}
export function Fragment<N extends Nodes>(props: { nodes: N }): N {
  return props.nodes;
}

// createBase
export function create<P extends Props>(
  setup: Setup<P>,
  props: P | null,
  ...nodes: Nodes
): Kit<P>;
// createFlat
export function create<P extends Props, N extends Nodes>(
  setup: Fragment<N>,
  props: {} | null,
  ...nodes: N
): N;
// createImpl
export function create<P extends Props, N extends Nodes>(
  setup: Setup<P> | Fragment<N>,
  props: P | null,
  ...nodes: Nodes
): Kit<P> | N {
  if (props == null) props = {} as P;
  props.nodes = nodes;
  if (setup === Fragment) return Fragment({ nodes: nodes as N });
  return new Kit(setup as Setup<P>, props);
}
//#endregion

//#region events

export interface EventMap extends CoreEventMap {
}
//#endregion
