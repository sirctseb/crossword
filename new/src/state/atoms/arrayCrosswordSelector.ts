import { selectorFamily } from "recoil";
import { coerceToArray, coerceToObject } from "../../firebase-recoil";
import { crosswordAtomFamily } from "../../firebase-recoil/atoms";
import type { FirebaseArray } from "../../firebase/types";
import { ArrayCrossword } from "../types";

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

const coerceMatrixToObject = <T>(
  matrix: FirebaseArray<string, FirebaseArray<string, T>>
): Record<string, Record<string, T>> => {
  const outer = coerceToObject(matrix);
  return Object.keys(outer).reduce<Record<string, Record<string, T>>>(
    (acc, key) => {
      acc[key] = coerceToObject(outer[key]);
      return acc;
    },
    {}
  );
};

export const arrayCrosswordSelector = selectorFamily<
  ArrayCrossword,
  { crosswordId: string }
>({
  key: `crossword-retyped`,
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
        clues: {
          across: coerceMatrixToObject(crossword.clues?.across ?? {}),
          down: coerceMatrixToObject(crossword.clues?.down ?? {}),
        },
      };
    },
});
