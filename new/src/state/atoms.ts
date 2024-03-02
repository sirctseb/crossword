import { atom, selectorFamily } from "recoil";
import { ArrayCrossword, crosswordAtomFamily } from "../firebase-recoil/atoms";
import { coerceToArray } from "../firebase-recoil";
import type { FirebaseArray } from "../firebase/types";

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
      };
    },
});

interface LabeledBox {
  row: number;
  column: number;
  label: number;
}

/**
 * Returns a map from directions to a list of boxes with their rows, columns, and labels
 */
export const clueAddressesSelector = selectorFamily<
  {
    across: LabeledBox[];
    down: LabeledBox[];
  },
  { crosswordId: string }
>({
  key: "clue-addresses",
  get:
    ({ crosswordId }) =>
    ({ get }) => {
      const crossword = get(arrayCrosswordFamily({ crosswordId }));
      const labeledBoxes: { across: LabeledBox[]; down: LabeledBox[] } = {
        across: [],
        down: [],
      };
      let clueIndex = 1;
      for (let row = 0; row < crossword.rows; row += 1) {
        for (let column = 0; column < crossword.rows; column += 1) {
          const blocked = crossword.boxes[row][column].blocked;
          const leftBlocked =
            column === 0 || crossword.boxes[row][column - 1].blocked;
          const topBlocked =
            row === 0 || crossword.boxes[row - 1][column].blocked;
          const indexBox = !blocked && (leftBlocked || topBlocked);
          if (indexBox && leftBlocked) {
            labeledBoxes.across.push({ row, column, label: clueIndex });
          }
          if (indexBox && topBlocked) {
            labeledBoxes.down.push({ row, column, label: clueIndex });
          }
          if (indexBox) {
            clueIndex += 1;
          }
        }
      }
      return labeledBoxes;
    },
});

/**
 * Returns a map from row to column to the label at that square
 */
export const labelMapSelector = selectorFamily<
  Record<number, Record<number, number>>,
  { crosswordId: string }
>({
  key: "label-map",
  get:
    ({ crosswordId }) =>
    ({ get }) => {
      const addresses = get(clueAddressesSelector({ crosswordId }));
      const map: Record<number, Record<number, number>> = {};
      const directions = ["across", "down"] as const;
      directions.forEach((direction) => {
        addresses[direction].forEach((address) => {
          map[address.row] = map[address.row] || {};
          map[address.row][address.column] = address.label;
        });
      });
      return map;
    },
});
