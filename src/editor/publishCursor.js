import React, { useState, useEffect } from 'react';

export default Editor => (props) => {
  const [cursorRef, setCursorRef] = useState(null);

  const handleBoxFocus = (cursor) => {
    // TODO we shouldn't be setting the redux cursor state here
    props.actions.setCursor(cursor, props.match.params.crosswordId);
    cursorRef.update(cursor);
  };

  useEffect(() => {
    const newCursorRef = props.firebase
      .ref(`cursors/${props.match.params.crosswordId}`)
      .push({
        userId: props.firebase.auth().currentUser.uid,
      });

    newCursorRef.onDisconnect().set(null);

    setCursorRef(newCursorRef);

    return () => {
      // remove onDelete
      newCursorRef.onDisconnect().cancel();
      // delete cursor
      newCursorRef.set(null);
    };
  }, [props.match.params.crosswordId]);

  return (<Editor {...props} onBoxFocus={handleBoxFocus} />);
};
