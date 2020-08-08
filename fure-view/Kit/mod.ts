import { Component } from "../../fure-core/mod.ts";
import { EventMap as EMap, OptPromise } from "../../fure-core/_util/mod.ts";
import type { Devtools } from "./Devtools.ts";
import type { Reactive, State } from "./Reactive.ts";
import type { WebDom } from "./WebDom.ts";

export interface Props {
  nodes?: Readonly<unknown[]>;
}

export interface Setup<P extends Props> {
  name: string;
  (
    this: Kit<P>,
    props: Readonly<P>,
  ): OptPromise<void | null | undefined | KitAny | KitAny[]>;
}

/*private*/ const symbol$parent = Symbol("parent");
/*private*/ const symbol$nodes = Symbol("nodes");

export class Kit<P extends {}> extends Component<EventMap> {
  constructor(
    readonly setup: Setup<P>,
    readonly props: Readonly<P>,
  ) {
    super(setup.name);
  }

  // state storage
  readonly store = new Map();
  // configuration
  static config = {};
  readonly config = { ...Kit.config };

  // run
  async run() {
    const node = await Promise.resolve(this.setup(this.props));
    const nodes = Array.isArray(node) ? node : [node];
    const tasks = nodes
      .filter((node): node is KitAny => node instanceof Kit)
      .filter((node) => this.mount(node))
      .map((node) => node.run());
    await Promise.all(tasks);
  }

  //#region node tree

  // create
  static create<P extends {}>(
    setup: Setup<P>,
    props = {} as Omit<P, "nodes"> & Props,
    ...nodes: P extends { nodes: infer Nodes } ? Nodes : never[]
  ): Kit<P> {
    if (props.nodes == null) props.nodes = nodes;
    else if (nodes.length > 0) throw new Error("duplicate props `nodes`");
    return new Kit(setup, props as P);
  }

  // tree
  private [symbol$parent]: KitAny | null = null;
  get parent(): KitAny | null {
    return this[symbol$parent];
  }
  get origin(): KitAny {
    if (this.parent == null) return this;
    return this.parent.origin;
  }

  // nodes
  private [symbol$nodes] = new Set<KitAny>();
  *nodes(): IterableIterator<KitAny> {
    for (const node of this[symbol$nodes]) {
      yield node; // export lazy list
    }
  }
  mount(node: KitAny): /*autorun*/ boolean {
    if (node.parent == this) return false;
    node.unmount();
    node[symbol$parent] = this;
    this[symbol$nodes].add(node);
    return node.dispatchEvent(new LifeEvent("mount", true));
  }
  unmount() {
    if (this.parent == null) return;
    this.dispatchEvent(new LifeEvent("unmount"));
    this.parent[symbol$nodes].delete(this);
    this[symbol$parent] = null;
  }
  //#endregion

  //#region extension
  static openDevtools = () => import("./Devtools.ts");
  static openReactive = () => import("./Reactive.ts");
  static openWebDom = () => import("./WebDom.ts");
  //#endregion
}

// deno-lint-ignore no-empty-interface
export interface Kit<P extends {}> extends Devtools, Reactive, WebDom {}
export { State };
// deno-lint-ignore no-explicit-any
export type KitAny = Kit<any>; // f**k

//

//#region events

export interface EventMap extends EMap {
  unmount: LifeEvent;
}
export class LifeEvent extends Event {
  constructor(type: string, cancelable?: boolean) {
    super(type, { cancelable });
  }
}
export interface LifeEvent {
  readonly target: KitAny;
}
//#endregion
