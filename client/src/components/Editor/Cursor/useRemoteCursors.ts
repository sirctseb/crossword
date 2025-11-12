import { useRemoteCursors as useFirebaseRemoteCursors } from "../../firebase-hooks/hooks";
import { type Cursor } from "../../../firebase/types";

export type Entity<T> = T & {
  id: string;
};

export type CursorMap = Record<
  number,
  Record<number, Entity<Cursor>[] | undefined> | undefined
>;

// TODO why isn't this in another selector or just inline in the
// remoteCursors atom?
const reduceCursors = (cursors: Record<string, Cursor>): CursorMap => {
  const result: CursorMap = {};
  Object.entries(cursors).forEach(([id, cursor]) => {
    if (cursor.row !== undefined && cursor.column !== undefined) {
      const vector = (result[cursor.row] ||= {});
      // TODO this part with adding the id to the object data is probably something
      // we want to support in firebase-recoil
      vector[cursor.column] = [
        ...(vector[cursor.column] || []),
        { ...cursor, id },
      ];
    }
  });
  return result;
};

export const useRemoteCursors = (
  crosswordId: string,
  cursorId: string | null
): CursorMap => {
  const remoteCursors = useFirebaseRemoteCursors(crosswordId, cursorId);
  return reduceCursors(remoteCursors);
};

export const test = {
  reduceCursors,
};
