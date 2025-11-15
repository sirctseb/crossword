import type {
  CommunalCrossword,
  Crossword,
  Cursor,
  FirebaseList,
  FirebaseReadValue,
  Matrix,
  User,
} from "../../firebase/types";
import { makeAtom, makeAtomFamily } from "../../jotai-firebase";
import { atomFamily } from "jotai/utils";
import deepEqual from "fast-deep-equal";
import { atom, type Atom } from "jotai";
import {
  type CursorMap,
  deriveAllAnswers,
  deriveArrayCrossword,
  deriveClueAddresses,
  deriveLabeledAddressMap,
  reduceCursors,
} from "../derivations";
import type { ArrayCrossword, LabeledAddressCatalog } from "../types";
import { getFirebaseDatabase } from "../../firebase";

const database = getFirebaseDatabase();

export const communalCrosswordAtom = makeAtom<CommunalCrossword>(
  "/communalCrossword",
  database,
  // you can't skeleton data this, there is string value that is a key
  { current: "", archive: {} }
);

export const wordListAtomFamily = makeAtomFamily<
  User["wordlist"],
  { userId: string }
>("/users/{userId}/wordlist", database, {});

export const userCrosswordsAtomFamily = makeAtomFamily<
  User["crosswords"],
  { userId: string }
>("/users/{userId}/crosswords", database, {});

type Cursors = FirebaseReadValue<FirebaseList<Cursor>>;
export const cursorAtomFamily = makeAtomFamily<
  Cursors,
  { crosswordId: string }
>("/cursors/{crosswordId}", database, {});

export const remoteCursorAtomFamily = atomFamily<
  { crosswordId: string; cursorId: string | null },
  Atom<CursorMap | null | Promise<CursorMap | null>>
>((params) => {
  return atom((get) => {
    return Promise.resolve(
      get(cursorAtomFamily({ crosswordId: params.crosswordId }))
    ).then((resolvedCursors) => {
      if (!resolvedCursors) {
        return {};
      }
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

export const crosswordAtomFamily = makeAtomFamily<
  Crossword,
  { crosswordId: string }
>("/crosswords/{crosswordId}", database, {
  clues: { across: {}, down: {} },
  title: "skeleton title",
  rows: 1,
  symmetric: true,
});

// TODO we should make an atomFamily wrapper that uses deepEqual
export const arrayCrosswordAtomFamily = atomFamily<
  { crosswordId: string },
  Atom<ArrayCrossword | Promise<ArrayCrossword>>
>((params) => {
  return atom((get) => {
    const crossword = get(
      crosswordAtomFamily({ crosswordId: params.crosswordId })
    );
    if (crossword instanceof Promise) {
      return crossword.then((resolvedCrossword) => {
        return deriveArrayCrossword(resolvedCrossword);
      });
    }
    return deriveArrayCrossword(crossword);
  });
}, deepEqual);

export const allAnswersAtomFamily = atomFamily<
  { crosswordId: string },
  Atom<string[] | Promise<string[]>>
>((get) => {
  return atom((getAtom) => {
    const arrayCrossword = getAtom(
      arrayCrosswordAtomFamily({ crosswordId: get.crosswordId })
    );
    if (arrayCrossword instanceof Promise) {
      return arrayCrossword.then((resolvedArrayCrossword) => {
        return deriveAllAnswers(resolvedArrayCrossword);
      });
    }
    return deriveAllAnswers(arrayCrossword);
  });
}, deepEqual);

export const labeledAddressCatalogAtomFamily = atomFamily<
  { crosswordId: string },
  Atom<LabeledAddressCatalog | Promise<LabeledAddressCatalog>>
>((params) => {
  return atom((get) => {
    const crossword = get(
      arrayCrosswordAtomFamily({ crosswordId: params.crosswordId })
    );
    if (crossword instanceof Promise) {
      return crossword.then(deriveClueAddresses);
    }
    return deriveClueAddresses(crossword);
  });
}, deepEqual);

export const labeledAddressMapAtomFamily = atomFamily<
  {
    crosswordId: string;
  },
  Atom<Matrix<number> | Promise<Matrix<number>>>
>((params) => {
  return atom((get) => {
    return Promise.resolve(
      get(labeledAddressCatalogAtomFamily({ crosswordId: params.crosswordId }))
    ).then(deriveLabeledAddressMap);

    // const labeledAddressCatalog = get(
    //   labeledAddressCatalogAtomFamily({ crosswordId: params.crosswordId })
    // );
    // if (labeledAddressCatalog instanceof Promise) {
    //   return labeledAddressCatalog.then((resolvedCatalog) => {
    //     return deriveLabeledAddressMap(resolvedCatalog);
    //   });
    // }

    // return deriveLabeledAddressMap(labeledAddressCatalog);
  });
}, deepEqual);

export const connectionAtom = makeAtom<boolean>(
  ".info/connected",
  database,
  false
);
