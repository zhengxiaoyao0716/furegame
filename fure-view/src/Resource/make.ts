interface THColor {
  /**   0x123DEF   */value: number;
  /**  base64 uri  */data: string;
  /**   "123def"   */color: string;
  /**   "#123DEF"  */hex: string;
  rgb: { R: number; G: number; B: number };
  alpha: number;
  rgba: { R: number; G: number; B: number; A: number };
}

const newColor = (value: number, data: string): THColor => {
  const color = value.toString(16);
  if (value > 0xFFFFFFFF) throw new Error(`color value overflow: ${color}`);
  const hex = `#${color.toUpperCase()}`;
  const R = value / 0x01000000 | 0;
  const G = (value / 0x00010000 | 0) % 0x100;
  const B = (value & 0x0000FF00) >> 8;
  const A = value & 0x000000FF;
  return {
    value, data, color, hex,
    rgb: { R, G, B }, alpha: A, rgba: { R, G, B, A },
  };
};

export const THColors = {
  /** red */
  Reimu: newColor(0xCB1B45ff, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAE0lEQVQoU2M8Le36nwEPYBwZCgDiuxFZv0b9QAAAAABJRU5ErkJggg=='),
  /** black */
  Marisa: newColor(0x1C1C1Cff, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAE0lEQVQoU2OUkZH5z4AHMI4MBQAGEgqh6nJAewAAAABJRU5ErkJggg=='),
  /** yellow */
  Alice: newColor(0xE98B2Aff, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAE0lEQVQoU2N82a31nwEPYBwZCgDzHRTxpXyovQAAAABJRU5ErkJggg=='),
  /** baka */
  Cirno: newColor(0x58B2DCff, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVQoU2OM2HTnPwMewDgyFAAAMsMXMXWBeqIAAAAASUVORK5CYII='),
  /** white */
  Sakuya: newColor(0xFCFAF2ff, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVQoU2P88+vTfwY8gHFkKAAA1JcfQVtkt10AAAAASUVORK5CYII='),
  /** green */
  Youmu: newColor(0x227D51ff, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAE0lEQVQoU2NUqg38z4AHMI4MBQDO6A+BFQpJiAAAAABJRU5ErkJggg=='),
  /** sakura */
  Yuyuko: newColor(0xFEDFE1ff, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVQoU2P8d//hfwY8gHFkKAAAFOcd8YzlO0MAAAAASUVORK5CYII='),
  /** purple */
  Yakumo: newColor(0x4A225Dff, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAE0lEQVQoU2P0Uor9z4AHMI4MBQAdPA5J0HdVbgAAAABJRU5ErkJggg=='),
};

export { Texture } from 'pixi.js';
