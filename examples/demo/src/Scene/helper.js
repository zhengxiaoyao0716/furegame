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
