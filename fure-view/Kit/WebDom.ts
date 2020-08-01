// would conflict with built-in libs, f**k /// <reference lib="dom"/>

import { OptPromise } from "../../fure-core/_util/mod.ts";
import { Kit } from "./mod.ts";

const symbol$htmlId = Symbol("htmlId");

export interface WebDom {
  r2s(): Promise<string>;
  readonly renderToString: WebDom["r2s"];

  [symbol$htmlId]: number;
  html(...args: Parameters<StringConstructor["raw"]>): void;
}

//#region dom
Kit.prototype[symbol$htmlId] = 0;
Kit.prototype.html = function (template, ...subs) {
  const id = Kit.prototype[symbol$htmlId]++;
  const name = `_FURE_VIEW_HTML(${this.name})#${id}`;

  const html = String.raw(template, subs);
};

interface Dom<T> {}
//#endregion

//#region render

function renderToString(this: Kit<any>) {
  return "";
}

function renderToElement(
  this: Kit<any>,
  root: Element | keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap,
) {
  if (!(root instanceof Element)) {
    root = document.querySelector(root) as Element;
  }
  root.innerHTML = ""; // TODO
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

Object.assign(Kit.prototype, { r2s: renderToString, renderToString });
//#endregion
