import * as Core from "../fure-core/Component.ts";
import { EventMap as CoreEventMap } from "../fure-core/_util/mod.ts";

export type Props = {
  chidren?: Component<Props>;
} | null;

export interface Render<P extends Props> {
  name: string;
  (this: Component<P>, props: P): Promise<Component<Props> | void>;
}

export class Component<P extends Props> extends Core.Component<EventMap> {
  readonly render: Render<P>;
  readonly props: P;
  readonly children: Component<Props>[];
  constructor(
    render: Render<P>,
    props: P,
    ...children: Component<Props>[]
  ) {
    super(render.name);
    this.render = render.bind(this);
    this.props = props;
    this.children = children;

    this.dispatchEvent(new LifeEvent("mount", props));
    // TODO
  }
}

export function createComponent<P extends Props>(
  render: Render<P>,
  props: P,
  ...children: Component<Props>[]
): Component<P> {
  return new Component(render, props, ...children);
}

export interface EventMap extends CoreEventMap {
  mount: LifeEvent<Props>;
  unmount: LifeEvent<Props>;
}
export class LifeEvent<P extends Props> extends Event {
  constructor(type: string, readonly props: P) {
    super(type, { bubbles: true });
  }
}
