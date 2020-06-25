import { Element, Props } from "./Element.ts";

export function dict(
  elements: (Element<Props> | undefined)[],
): { [id: string]: Element<Props> | undefined } {
  return elements.reduce((dict, element, index) => ({
    ...dict,
    [genEleId(element, index)]: element,
  }), {});
}

export function genEleId(
  element: Element<Props> | undefined,
  index: number,
): string {
  if (element == null) return String(index);
  // TODO
  return `${element.name}+${genDepsId(element.props)}`;
}

export function genDepsId(deps: unknown): string {
  // TODO
  return JSON.stringify(deps);
}
