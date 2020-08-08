import { Kit, KitAny } from "./mod.ts";

export interface Devtools {
  [Deno.customInspect](): string;
}

function printPropVal(val: unknown): string {
  if (typeof val == "string") return `"${val}"`;
  if (Array.isArray(val)) return `[${val.toString()}]`;
  return `{${String(val)}}`;
}

function customInspect(
  this: KitAny,
  space: string = "  ",
): string {
  const keyVals = Object.entries(this.props)
    .filter(([key]) => key != "nodes")
    .map(([key, val]) => `${key}=${printPropVal(val)}`).join(" ");
  let props = keyVals && ` ${keyVals}`;
  if (this.dom != undefined) props += ` dom="${this.dom.name}"`;

  const nodes = Array.from(this.nodes());
  if (nodes.length == 0) return `<${this.name}${props}/>`;

  const inner = nodes.map((e) =>
    e?.[Deno.customInspect]()?.replace(/\n/g, `\n${space}`)
  ).join(`\n${space}`);
  return `<${this.name}${props}>\n${space}${inner}\n</${this.name}>`;
}

Object.assign(Kit.prototype, {
  [Deno.customInspect]: customInspect,
});
