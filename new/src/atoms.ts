import { atom, selectorFamily } from "recoil";
import { ArrayCrossword, crosswordAtomFamily } from "./firebase-recoil/atoms";
import { coerceToArray } from "./firebase-recoil";
import type { FirebaseArray } from "./firebase/types";

interface Cursor {
  row: number;
  column: number;
  direction: "across" | "down";
}

export const cursorAtom = atom<Cursor>({
  key: "cursor",
  default: {
    row: 0,
    column: 0,
    direction: "across",
  },
});

// alternative approach would be to have an access utility like get
// to gracefully degrade to null / default value on value absence. lib could
// provide that also. we may have to revisit this if these selectors turn
// out to be slow
export const coerceMatrixToArray = <T>(
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
