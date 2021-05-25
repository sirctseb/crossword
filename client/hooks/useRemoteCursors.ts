import firebase from 'firebase';
import { selector, selectorFamily, SerializableParam, useRecoilValue } from 'recoil';
import { Cursor, Cursors, List, Matrix } from '../firebase-recoil/data';

type CursorMap = Record<number, Record<number, Cursor[] | undefined> | undefined>;

const reduceCursors = (cursors: Cursor[]) =>
  cursors.reduce<CursorMap>((result: CursorMap, cursor: Cursor) => {
    const { row, column } = cursor;
    if (row === undefined || column === undefined) {
      return result;
    }
    return {
      ...result,
      [row]: {
        ...result[row],
        [column]: [...(result[row]?.[column] || []), cursor],
      },
    };
  }, {});

type OnlyOtherCursorsParams = SerializableParam & {
  cursorId: string | null;
  crosswordId: string;
};

const OnlyOtherCursors = selectorFamily<List<Cursor>, OnlyOtherCursorsParams>({
  key: 'OtherCursors',
  get: ({ crosswordId, cursorId }) => ({ get }) => {
    const data = get(Cursors({ crosswordId }));

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

  return reduceCursors(Object.values(remoteCursors));
};

export default useRemoteCursors;

export const test = {
  reduceCursors,
};
