export interface EventListener<E extends Event> {
  (evt: E): void | Promise<void>;
}

export interface EventListenerObject<E extends Event> {
  handleEvent(evt: E): void | Promise<void>;
}

export type EventListenerOrEventListenerObject<E extends Event> =
  | EventListener<E>
  | EventListenerObject<E>;

export interface EventMap {
  [tye: string]: Event;
}

export interface EventTarget<EM extends EventMap>
  extends globalThis.EventTarget {
  addEventListener<K extends keyof EM>(
    type: K,
    listener: EventListenerOrEventListenerObject<EM[K]> | null,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof EM>(
    type: K,
    listener: EventListenerOrEventListenerObject<EM[K]> | null,
    options?: boolean | EventListenerOptions,
  ): void;
}

export const EventTarget: {
  prototype: EventTarget<EventMap>;
  new <EM extends EventMap>(): EventTarget<EM>;
  // deno-lint-ignore no-explicit-any
} = (window as any).EventTarget;
