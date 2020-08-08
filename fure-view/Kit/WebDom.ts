// would conflict with built-in libs, f**k /// <reference lib="dom"/>

import { hashCode } from "../../fure-core/_util/mod.ts";
import { Kit, KitAny } from "./mod.ts";

const symbol$subId = Symbol("subId");

export interface WebDom {
  r2s(): Promise<string>;
  readonly renderToString: WebDom["r2s"];

  [symbol$subId]: number;
  dom?: Dom;
  html(...args: Parameters<StringConstructor["raw"]>): Promise<Dom>;
}

//#region dom

async function resolveSub(this: KitAny, sub: unknown): Promise<string> {
  if (sub instanceof Kit) {
    const autorun = this.mount(sub);
    const id = ++this[symbol$subId];
    autorun && await sub.run();
    if (sub.dom == undefined) return "";
    sub.dom[symbol$subId] = id;
    return sub.dom.html;
  }
  if (Array.isArray(sub)) {
    const subs = await Promise.all(sub.map(resolveSub.bind(this)));
    return subs.join("");
  }
  // TODO resolve special subs like onevent callback?
  return String(sub);
}

class Dom {
  constructor(
    readonly kit: KitAny,
    readonly hash: string,
    readonly html: string,
  ) {
    // TODO
  }
  // TODO queryElement()

  [symbol$subId] = 0;
  get name(): string {
    return `${this.kit.name}#${this[symbol$subId]}${this.hash}`;
  }
}

Kit.prototype.html = async function (temp, ...subs) {
  const code = hashCode(temp.toString());
  const hash = (code > 0 ? "+" : "") + code.toString(16);

  this[symbol$subId] = 0;
  const fill = Promise.all(subs.map(resolveSub.bind(this)));

  const html = String.raw(temp, ...await fill);
  this.dom = new Dom(this, hash, html);
  return this.dom;
};
//#endregion

//#region render

async function renderToString(this: KitAny) {
  return this.dom?.html ?? ""; // TODO insert id into root element for select?
}

async function renderToElement(
  this: KitAny,
  root: Element | keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap,
) {
  if (!(root instanceof Element)) {
    root = document.querySelector(root) as Element;
  }
  root.innerHTML = ""; // TODO innerHTML has already be rendered by server-side?
}

//#region f**k
declare class Element {
  innerHTML: string;
}
interface HTMLElementTagNameMap {
  "a": Element;
  "div": Element;
}
interface SVGElementTagNameMap {
  "a": Element;
  "circle": Element;
}
// deno-lint-ignore no-namespace
declare namespace document {
  function querySelector<K extends keyof HTMLElementTagNameMap>(
    selectors: K,
  ): HTMLElementTagNameMap[K] | null;
  function querySelector<K extends keyof SVGElementTagNameMap>(
    selectors: K,
  ): SVGElementTagNameMap[K] | null;
  function querySelector<E extends Element = Element>(
    selectors: string,
  ): E | null;
}
//#endregion

Object.assign(
  Kit.prototype,
  {
    r2s: renderToString,
    renderToString,
    r2e: renderToElement,
    renderToElement,
  },
);
//#endregion
