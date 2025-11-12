import { getDatabase } from "firebase/database";
import type { CommunalCrossword, Cursor, User } from "../../firebase/types";
import { makeAtom, makeAtomFamily } from "../../jotai-firebase";
import { atomFamily } from "jotai/utils";
import deepEqual from "fast-deep-equal";
import { atom, type Atom } from "jotai";

const database = getDatabase();

export const communalCrosswordAtom = makeAtom<CommunalCrossword>(
  "/communalCrossword",
  database,
  // you can't skeleton data this, there is string value that is a key
  { current: "", archive: {} }
);

export const wordListAtomFamily = makeAtomFamily<
  User["wordlist"],
  { userId: string }
>("/users/{userId}/wordlist", database, []);

export const userCrosswordsAtomFamily = makeAtomFamily<
  User["crosswords"],
  { userId: string }
>("/users/{userId}/crosswords", database, []);

type Cursors = Record<string, Cursor>;
export const cursorAtomFamily = makeAtomFamily<
  Cursors,
  { crosswordId: string }
>("/cursors/{crosswordId}", database, {});

export type Entity<T> = T & {
  id: string;
};
export type CursorMap = Record<
  number,
  Record<number, Entity<Cursor>[] | undefined> | undefined
>;
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

export const remoteCursorAtomFamily = atomFamily<
  { crosswordId: string; cursorId: string | null },
  // we fall back into some promises here but it remains transparent
  // above the useAtomValue level in the component
  Atom<CursorMap | Promise<CursorMap>>
  // Atom<Indexable<CursorMap>>
>((params) => {
  return atom((get) => {
    const cursors = get(cursorAtomFamily({ crosswordId: params.crosswordId }));
    if (cursors instanceof Promise) {
      return cursors.then((resolvedCursors) => {
        const { [params.cursorId ?? ""]: _, ...remoteCursors } =
          resolvedCursors;
        return reduceCursors(remoteCursors);
      });
    }

    const { [params.cursorId ?? ""]: _, ...remoteCursors } = cursors ?? {};
    return reduceCursors(remoteCursors);
  });
}, deepEqual);
