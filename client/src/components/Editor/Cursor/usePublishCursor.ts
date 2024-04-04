import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import {
  get,
  onDisconnect,
  push,
  ref,
  remove,
  update,
  onValue,
} from "firebase/database";
import { useFirebase } from "../../../firebase/useFirebase";
import { cursorAtomFamily } from "../../../state";
import { connectionAtom } from "../../../firebase-recoil/atoms";

type UsePublishCursorResult = string | null;

export const usePublishCursor = (
  crosswordId: string
): UsePublishCursorResult => {
  const [key, setKey] = useState<string | null>(null);

  const {
    database,
    auth: { currentUser },
  } = useFirebase();
  const cursor = useRecoilValue(cursorAtomFamily({ crosswordId }));
  // if i subscribed to the connection state here, we could probably use that
  // to trigger these effects to reestablish the cursor in the right way
  const connected = useRecoilValue(connectionAtom);

  // establish the cursor
  useEffect(() => {
    if (connected) {
      const { key } = push(ref(database, `cursors/${crosswordId}`), {
        userId: currentUser?.uid,
        row: cursor.row,
        column: cursor.column,
      });
      setKey(key);
      return () => {
        remove(ref(database, `cursors/${crosswordId}/${key}`));
      };
    }
    // TODO so here's a case where I think we legitimately want to use a value
    // in the effect but don't want to include it in the dependency array
  }, [crosswordId, currentUser?.uid, database, connected]);

  // update the cursor
  useEffect(() => {
    if (key) {
      update(ref(database, `cursors/${crosswordId}/${key}`), {
        row: cursor.row,
        column: cursor.column,
      });
    }
  }, [crosswordId, cursor, database, key]);

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
