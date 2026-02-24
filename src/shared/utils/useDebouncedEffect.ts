import { useEffect, type DependencyList } from 'react';

export const useDebouncedEffect = (
  effect: () => void,
  deps: DependencyList,
  delay: number,
): void => {
  useEffect(() => {
    const timer = setTimeout(() => effect(), delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
};
