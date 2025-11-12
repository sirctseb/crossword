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

export const remoteCursorAtomFamily = atomFamily<
  { crosswordId: string; cursorId: string | null },
  // we fall back into some promises here but it remains transparent
  // above the useAtomValue level in the component
  Atom<Cursors | Promise<Cursors>>
  // Atom<Indexable<Cursor>>
>((params) => {
  return atom((get) => {
    const cursors = get(cursorAtomFamily({ crosswordId: params.crosswordId }));
    if (cursors instanceof Promise) {
      return cursors.then((resolvedCursors) => {
        const { [params.cursorId ?? ""]: _, ...remoteCursors } =
          resolvedCursors;
        return remoteCursors;
      });
    }

    const { [params.cursorId ?? ""]: _, ...remoteCursors } = cursors;
    return remoteCursors;
  });
}, deepEqual);
