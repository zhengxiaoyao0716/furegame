import { Component } from "../fure-core/mod.ts";
import { EventMap as CoreEventMap } from "../fure-core/_util/mod.ts";

export interface Props {
  nodes?: any[];
}
export interface Setup<P extends {}> {
  name: string;
  (
    this: Kit<P>,
    props: Readonly<P>,
  ): Kit.JSX.Element | Promise<Kit.JSX.Element>;
}

export class Kit<P extends {}> extends Component<EventMap> {
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
    type Element = void | null | undefined | Kit<{}>;
    interface ElementClass extends Kit<{}> {
      readonly setup: Setup<{}>;
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

export function create<P extends {}>(
  setup: Setup<P>,
  props: P = {} as P,
  ...nodes: any[]
): Kit<P> {
  if (nodes.length > 0 && !("nodes" in props)) {
    (props as Props).nodes = nodes;
  }
  return new Kit(setup, props);
}
//#endregion

//#region events

export interface EventMap extends CoreEventMap {
}
//#endregion
