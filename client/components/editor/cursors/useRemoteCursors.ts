import firebase from 'firebase';
import { selectorFamily, SerializableParam, useRecoilValue } from 'recoil';
import { Cursor, Cursors, Entity, List } from '../../../firebase-recoil/data';

type CursorMap = Record<number, Record<number, Entity<Cursor>[] | undefined> | undefined>;

const reduceCursors = (cursors: List<Cursor>): CursorMap => {
  const result: CursorMap = {};
  Object.entries(cursors).forEach(([id, cursor]) => {
    if (cursor.row !== undefined && cursor.column !== undefined) {
      const vector = (result[cursor.row] ||= {});
      // TODO this part with adding the id to the object data is probably something
      // we want to support in firebase-recoil
      vector[cursor.column] = [...(vector[cursor.column] || []), { ...cursor, id }];
    }
  });
  return result;
};

type OnlyOtherCursorsParams = SerializableParam & {
  cursorId: string | null;
  crosswordId: string;
};

const OnlyOtherCursors = selectorFamily<List<Cursor>, OnlyOtherCursorsParams>({
  key: 'OtherCursors',
  get: ({ crosswordId, cursorId }) => ({ get }) => {
    const data = { ...get(Cursors({ crosswordId })) };

    if (!data) {
      return {};
    }

    if (cursorId) {
      delete data[cursorId];
    }
    return data;
  },
});

const useRemoteCursors = (crosswordId: string, cursorRef: firebase.database.Reference | null): CursorMap => {
  const remoteCursors = useRecoilValue(OnlyOtherCursors({ crosswordId, cursorId: cursorRef && cursorRef.key }));

  if (!remoteCursors) {
    return [];
  }

  return reduceCursors(remoteCursors);
};

export default useRemoteCursors;

export const test = {
  reduceCursors,
};
