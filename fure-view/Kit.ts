import { Component } from "../fure-core/mod.ts";
import { EventMap as EMap, OptPromise } from "../fure-core/_util/mod.ts";

export interface Props {
  nodes?: Readonly<any[]>;
}

export interface Setup<P extends Props> {
  name: string;
  (
    this: Kit<P>,
    props: Readonly<P>,
  ): OptPromise<void | null | undefined | Kit<any> | Kit<any>[]>;
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
      .filter((node): node is Kit<any> => node instanceof Kit)
      .filter((node) => this.mount(node))
      .map((node) => node.run());
    await Promise.all(tasks);
  }

  //#region node tree

  // create
  static create<P extends {}>(
    setup: Setup<P>,
    props = {} as P & Props,
    ...nodes: any[]
  ): Kit<P> {
    if (props.nodes == null) props.nodes = nodes;
    else if (nodes.length > 0) throw new Error("duplicate props `nodes`");
    return new Kit(setup, props);
  }

  // tree
  private [symbol$parent]: Kit<any> | null = null;
  get parent(): Kit<any> | null {
    return this[symbol$parent];
  }
  get origin(): Kit<any> {
    if (this.parent == null) return this;
    return this.parent.origin;
  }

  // nodes
  private [symbol$nodes] = new Set();
  mount(node: Kit<any>) {
    if (node.parent == this) return false;
    node.unmount();
    node[symbol$parent] = this;
    this[symbol$nodes].add(node);
    return true;
  }
  unmount() {
    if (this.parent == null) return false;
    this.parent[symbol$nodes].delete(this);
    this[symbol$parent] = null;
    return true;
  }
  //#endregion

  //#region inspect

  [Deno.customInspect](space: string = "  "): string {
    const keyVals = Object.entries(this.props)
      .filter(([key]) => key != "nodes")
      .map(([key, val]) =>
        `${key}=${typeof val == "string" ? `"${val}"` : `{${val}}`}`
      ).join(" ");
    const props = keyVals && ` ${keyVals}`;

    const nodes = Array.from(this[symbol$nodes]) as Kit<any>[];
    if (nodes.length == 0) return `<${this.name}${props}/>`;

    const inner = nodes.map((e) =>
      e?.[Deno.customInspect]()?.replace(/\n/g, `\n${space}`)
    ).join(`\n${space}`);
    return `<${this.name}${props}>\n${space}${inner}\n</${this.name}>`;
  }
  //#endregion
}

//

//#region events

export interface EventMap extends EMap {
}
export class LifeEvent<P extends Props> extends Event {
  constructor(type: string) {
    super(type, { bubbles: true });
  }
}
//#endregion
