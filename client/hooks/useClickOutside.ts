import { useEffect, useCallback } from 'react';

export default (node, onClickOutside) => {
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
