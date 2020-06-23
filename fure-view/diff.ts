import { Element, Props } from "./Element.ts";

export function dict(
  elements: (Element<Props> | undefined)[],
): { [id: string]: Element<Props> | undefined } {
  return elements.reduce((dict, element, index) => ({
    ...dict,
    [genId(index, element)]: element,
  }), {});
}

export function genId(
  index: number,
  element: Element<Props> | undefined,
): string {
  if (element == null) return String(index);
  // TODO
  return String(index);
}
