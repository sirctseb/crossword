import { useEffect, useCallback } from 'react';

const useClickOutside = (node: HTMLElement | null, onClickOutside: () => any) => {
  const handler = useCallback(
    (event) => {
      if (node && !node.contains(event.target)) {
        onClickOutside();
      }
    },
    [node, onClickOutside]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [handler]);
};

export default useClickOutside;
