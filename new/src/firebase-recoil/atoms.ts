import { makeAuthAtom } from "./auth";
import { getFirebaseApp, getFirebaseDatabase } from "../firebase";
import { makeAtomFamily } from ".";
import { coerceToArray } from "./";
import type { Box, Crossword, FirebaseArray } from "../firebase/types";
import { selectorFamily } from "recoil";

export const authAtom = makeAuthAtom(getFirebaseApp());

export const crosswordAtomFamily = makeAtomFamily<
  Crossword,
  { crosswordId: string }
>("/crosswords/{crosswordId}", getFirebaseDatabase());

export type ArrayCrossword = Omit<Crossword, "boxes"> & { boxes: Box[][] };

// alternative approach would be to have an access utility like get
// to gracefully degrade to null / default value on value absence. lib could
// provide that also. we may have to revisit this if these selectors turn
// out to be slow
const coerceMatrixToArray = <T>(
  matrix: FirebaseArray<string, FirebaseArray<string, T>>,
  defaultValue: T,
  rows: number,
  columns: number
): T[][] => {
  const outer = coerceToArray(matrix, {}, rows);
  return outer.map((inner) => coerceToArray(inner, defaultValue, columns));
};

export const arrayCrosswordFamily = selectorFamily<
  ArrayCrossword,
  { crosswordId: string }
>({
  key: `firebase-recoil:crossword-retyped`,
  get:
    (param) =>
    async ({ get }) => {
      const crossword = get(crosswordAtomFamily(param));
      return {
        ...crossword,
        boxes: coerceMatrixToArray(
          crossword.boxes ?? [],
          {},
          crossword.rows,
          crossword.rows
        ),
      };
    },
});
