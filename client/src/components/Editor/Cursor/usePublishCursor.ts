import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { onDisconnect, push, ref, remove, update } from "firebase/database";
import { useFirebase } from "../../../firebase/useFirebase";
import { cursorAtomFamily } from "../../../state";
import { connectionAtom } from "../../../state/atoms/firebaseAtoms";

type UsePublishCursorResult = string | null;

export const usePublishCursor = (
  crosswordId: string
): UsePublishCursorResult => {
  const [key, setKey] = useState<string | null>(null);

  const {
    database,
    auth: { currentUser },
  } = useFirebase();
  const cursor = useAtomValue(cursorAtomFamily(crosswordId));
  // if i subscribed to the connection state here, we could probably use that
  // to trigger these effects to reestablish the cursor in the right way
  const connected = useAtomValue(connectionAtom);
  const cursorExists = cursor !== null;

  // establish the cursor
  useEffect(() => {
    if (connected && cursorExists) {
      const { key } = push(ref(database, `cursors/${crosswordId}`), {
        userId: currentUser?.uid,
        row: cursor.row,
        column: cursor.column,
      });
      // the linter is complaining here because we are setting state in an effect
      // synchronously. i think normally, we would have to wait for the push to complete
      // and we would get the key asynchronously, so it wouldn't complain. push returns
      // the key synchronously though. i'm not sure if this causes a problem or not.
      // we could choose to wait on the promise that push returns, but there's no
      // non-linter reason to.
      setKey(key);
      return () => {
        remove(ref(database, `cursors/${crosswordId}/${key}`));
      };
    }
    // TODO so here's a case where I think we legitimately want to use a value
    // in the effect but don't want to include it in the dependency array
    // specifically, because we only want to run this when we change:
    // crossword, user, or connection.
    // but we do need to use the cursor values. we don't actually need to,
    // we could just create the cursor but leave the location blank until
    // the update effect runs, which we do update with cursor changes.
  }, [crosswordId, currentUser?.uid, database, connected, cursorExists]);

  // update the cursor
  useEffect(() => {
    if (key && cursorExists) {
      update(ref(database, `cursors/${crosswordId}/${key}`), {
        row: cursor.row,
        column: cursor.column,
      });
    }
    // do we want to yank the remote cursor down on blur when the
    // local cursor value goes to null?
  }, [crosswordId, cursor, database, key, cursorExists]);

  // register disconnect handler
  useEffect(() => {
    if (key) {
      const cursorDbRef = ref(database, `cursors/${crosswordId}/${key}`);
      onDisconnect(cursorDbRef).set(null);

      return () => {
        // remove onDelete
        onDisconnect(cursorDbRef).cancel();
        // delete cursor
        remove(cursorDbRef);
      };
    }
  }, [crosswordId, database, key]);

  return key;
};
