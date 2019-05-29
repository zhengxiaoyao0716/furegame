import { useCallback, useState } from 'react';

export const useSelect = <T,>(init?: T) => {
  const [selected, setSeleted] = useState(init);
  const selector = useCallback((value: T) => ({
    className: `${value === selected ? 'selected ' : ''}button`,
    onClick: () => setSeleted(value),
  }), [selected]);
  return [selected, selector];
};
