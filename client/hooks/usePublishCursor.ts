import { useState, useEffect, useCallback } from 'react';
import firebase from 'firebase';
import useFirebase from '../hooks/useFirebase';

const usePublishCursor = (crosswordId: string) => {
  const [cursorRef, setCursorRef] = useState<firebase.database.Reference | null>(null);
  const { root } = useFirebase();

  const handleBoxFocus = useCallback(
    (cursor) => {
      cursorRef?.update(cursor);
    },
    [crosswordId, cursorRef]
  );

  useEffect(() => {
    // TODO can currentUser actually be null? i think not with anonymous auth but we should confirm
    const newCursorRef = root.child(`cursors/${crosswordId}`).push({ userId: firebase.auth().currentUser?.uid });

    newCursorRef.onDisconnect().set(null);

    setCursorRef(newCursorRef);

    return () => {
      // remove onDelete
      newCursorRef.onDisconnect().cancel();
      // delete cursor
      newCursorRef.set(null);
    };
  }, [crosswordId]);

  return [cursorRef, handleBoxFocus];
};

export default usePublishCursor;
