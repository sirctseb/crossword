import { selectorFamily } from "recoil";
import {
  Address,
  Candidate,
  ArrayCrossword,
  type LabeledBox,
  type Direction,
} from "./types";
import { arrayCrosswordFamily, clueAddressesSelector, cursorAtom } from ".";
import { findNext } from "./derivationFunctions";

const findNextBlank = (
  crossword: ArrayCrossword,
  row: number,
  column: number,
  direction: Direction,
  clueAddresses: LabeledBox[]
): Candidate | null =>
  findNext(
    crossword,
    row,
    column,
    direction,
    clueAddresses,
    (candidate) => !candidate.box.content
  );

export const cursorAfterAdvancementSelector = selectorFamily<
  Address,
  {
    crosswordId: string;
  }
>({
  key: "cursor-after-advancement",
  get:
    (params) =>
    ({ get }) => {
      const crossword = get(arrayCrosswordFamily(params));
      const { row, column, direction } = get(cursorAtom);
      const clueAddresses = get(clueAddressesSelector(params));
      return (
        findNextBlank(
          crossword,
          row,
          column,
          direction,
          clueAddresses[direction]
        ) || { row, column }
      );
    },
});
