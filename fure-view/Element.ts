import { Component } from "../fure-core/mod.ts";
import { EventMap as CoreEventMap } from "../fure-core/_util/mod.ts";
import { useMemo } from "./hooks.ts";
import { dict, genId } from "./diff.ts";

export interface Props {
  key?: string;
  children?: Element<Props>[];
}

export interface Context {
  // TODO binded hooks
}

export interface Renderer<P extends Props> {
  name: string;
  (
    this: Element<P>,
    props: P,
    context: Context,
  ):
    | Promise<Element<Props> | Element<Props>[] | undefined>
    | Element<Props>
    | Element<Props>[]
    | undefined;
}

export class Element<P extends Props> extends Component<EventMap> {
  constructor(
    readonly renderer: Renderer<P>,
    readonly props: P,
  ) {
    super(renderer.name);
  }

  private readonly hooks = { run: [] as [] };
  #inner = [] as (Element<Props> | undefined)[];
  #lock: number | "mount" | "unmount" = "unmount";

  async render<E extends Element<P>>(this: E): Promise<E> {
    await useMemo(
      this.hooks.run,
      async () => {
        const lock = this.#lock;
        const unmount = this.update();
        for await (const e of unmount) {
          e.#lock = "unmount";
          e.dispatchEvent(new LifeEvent(e.#lock, e.props));
        }
        this.#lock = "mount";
        lock == "unmount" &&
          this.dispatchEvent(new LifeEvent(this.#lock, this.props));
      },
      this.props,
    );
    return this;
  }

  async *update(): AsyncIterable<Element<Props>> {
    const lock = Number.isInteger(this.#lock) ? 1 + (this.#lock as number) : 0;
    this.#lock = lock;

    const rendered = this.renderer.call(this, this.props, {} as any);
    const resolved = await Promise.resolve(rendered);
    if (this.#lock != lock) return; // cancel

    const elements = Array.isArray(resolved) ? resolved : [resolved];
    const innerNew = elements.map((e, i) => [genId(i, e), e] as const);
    const innerOld = dict(this.#inner);
    // diff elements
    for (const index in innerNew) {
      const [id] = innerNew[index];
      const old = innerOld[id];
      if (!old) continue;
      // reuse element
      innerOld[id] = undefined;
      innerNew[index] = [id, old];
    }
    // unmounted
    for (const id in innerOld) {
      const element = innerOld[id];
      element && (yield element);
    }

    // rerender
    this.#lock = 0;
    this.#inner = await Promise.all(innerNew.map(([_, e]) => e && e.render()));
  }

  [Deno.customInspect](space: string = "  "): string {
    const keyVals = Object.entries(this.props)
      .filter(([key]) => key != "children")
      .map(([key, val]) =>
        `${key}=${typeof val == "string" ? `"${val}"` : `{${val}}`}`
      ).join(" ");
    const props = keyVals && ` ${keyVals}`;

    if (this.#inner.length == 0) return `<${this.name}${props}/>`;

    const inner = this.#inner.map((e) =>
      e?.[Deno.customInspect]()?.replace(/\n/g, `\n${space}`)
    ).join(`\n${space}`);

    return `<${this.name}${props}>\n${space}${inner}\n</${this.name}>`;
  }
}

export function Fragment<P extends Props>({ children = [] }: P) {
  return children;
}

export function createElement<P extends Props>(
  renderer: Renderer<P>,
  props: P | null,
  ...childNodes: Element<Props>[] | [Element<Props>[]]
): Element<P> | Element<Props>[] {
  const children = Array.isArray(childNodes[0])
    ? childNodes[0]
    : childNodes as Element<Props>[];
  if (props == null) props = {} as P;
  props.children = children;
  if (renderer === Fragment) return Fragment(props);
  return new Element(renderer, props);
}

export async function renderElement<E extends Element<Props>>(
  element: E,
): Promise<E> {
  return await element.render();
}

//#region events
export interface EventMap extends CoreEventMap {
  mount: LifeEvent<Props>;
  unmount: LifeEvent<Props>;
}
export class LifeEvent<P extends Props> extends Event {
  constructor(type: string, readonly props: P) {
    super(type, { bubbles: true });
  }
}
//#endregion
