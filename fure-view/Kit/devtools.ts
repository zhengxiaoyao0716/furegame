import { Kit } from "./mod.ts";

export interface Devtools {
  [Deno.customInspect](): string;
}

function customInspect(
  this: Kit<any>,
  space: string = "  ",
): string {
  const keyVals = Object.entries(this.props)
    .filter(([key]) => key != "nodes")
    .map(([key, val]) =>
      `${key}=${typeof val == "string" ? `"${val}"` : `{${val}}`}`
    ).join(" ");
  const props = keyVals && ` ${keyVals}`;

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
