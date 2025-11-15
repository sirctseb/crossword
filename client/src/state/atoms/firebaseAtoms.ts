import { getDatabase } from "firebase/database";
import type { CommunalCrossword, Cursor, User } from "../../firebase/types";
import { makeAtom, makeAtomFamily } from "../../jotai-firebase";
import { atomFamily } from "jotai/utils";
import deepEqual from "fast-deep-equal";
import { atom, type Atom } from "jotai";
import { type CursorMap, reduceCursors } from "../derivations";

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
  Atom<CursorMap | Promise<CursorMap>>
>((params) => {
  return atom((get) => {
    return Promise.resolve(
      get(cursorAtomFamily({ crosswordId: params.crosswordId }))
    ).then((resolvedCursors) => {
      const { [params.cursorId ?? ""]: _, ...remoteCursors } = resolvedCursors;
      return reduceCursors(remoteCursors);
    });

    // simple version above by collapsing both cases to a promise.
    // if we benefit from keeping the synchronous case synchronous, we can
    // split it out like this:
    // if (cursors instanceof Promise) {
    //   return cursors.then((resolvedCursors) => {
    //     const { [params.cursorId ?? ""]: _, ...remoteCursors } =
    //       resolvedCursors;
    //     return reduceCursors(remoteCursors);
    //   });
    // }

    // const { [params.cursorId ?? ""]: _, ...remoteCursors } = cursors ?? {};
    // return reduceCursors(remoteCursors);
  });
}, deepEqual);
