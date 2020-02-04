import { useState, useEffect, useCallback } from 'react';
import { useFirebase } from 'react-redux-firebase';

export default (crosswordId) => {
  const [cursorRef, setCursorRef] = useState(null);
  const firebase = useFirebase();

  const handleBoxFocus = useCallback(
    cursor => cursorRef.update(cursor),
    [crosswordId, cursorRef]
  );

  useEffect(() => {
    const newCursorRef = firebase
      .ref(`cursors/${crosswordId}`)
      .push({ userId: firebase.auth().currentUser.uid });

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
