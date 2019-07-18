import { useCallback, useState } from 'react';

/**
 * @template T
 * @param {keyof T} [init] .
 * @param {T} [mapper] .
 * @returns {[keyof T | T[keyof T], (value: keyof T) => void]}
 */
export function useSelect(init, mapper) {
  const [selected, setSeleted] = useState(init);
  const selector = useCallback(value => ({
    className: `${value === selected ? 'selected ' : ''}button`,
    onClick: () => setSeleted(value),
  }), [selected]);
  return [mapper ? mapper[selected] : selected, selector];
}

export const playerPath = [
  { position: [0/*  */, 0/*  */], velocity: [0, 0], gravity: [] },
  // test velocity: d = vt = 0.6 * 1000
  { position: [0/*  */, 0/*  */], velocity: [0.6, 0], gravity: [] },
  { position: [600/**/, 0/*  */], velocity: [0, 0.6], gravity: [] },
  { position: [600/**/, 600/**/], velocity: [-0.6, 0], gravity: [] },
  { position: [0/*  */, 600/**/], velocity: [0, -0.6], gravity: [] },
  // test gravity: d = 0.5gt^2 = 0.5 * 0.5 * 1000**2
  { position: [0/*  */, 0/*  */], velocity: [0, 0], gravity: [0.0016, 0] },
  { position: [800/**/, 0/*  */], velocity: [0, 0], gravity: [0, 0.0016] },
  { position: [800/**/, 800/**/], velocity: [0, 0], gravity: [-0.0016, 0] },
  { position: [0/*  */, 800/**/], velocity: [0, 0], gravity: [0, -0.0016] },
];

export const playerAnims = [
  '　█　\n███\n█　█', '　█　\n█　█\n█　█', // 00, 01: idle
  '　　　\n███\n█　█', '　█　\n█　█\n█　█', // 02, 03: up
  '█　█\n███\n　　　', '█　█\n█　█\n　█　', // 04, 05: down
  '　██\n　█　\n　██', '　██\n█　 \n　██', // 06, 07: left
  '██　\n　█　\n██　', '██　\n 　█\n██　', // 08, 09: right
  '　█　\n█　█\n　█　', '█　█\n　█　\n█　█', // 10, 11: boom
];
