import { selectorFamily } from "recoil";
import {
  Address,
  Candidate,
  ArrayCrossword,
  type LabeledAddress,
  type Direction,
} from "../types";
import { findNext } from "../derivations";
import { arrayCrosswordSelector } from "./arrayCrosswordSelector";
import { cursorAtom } from "./cursorAtom";
import { clueAddressesSelector } from "./clueAddressesSelector";

const findNextBlank = (
  crossword: ArrayCrossword,
  row: number,
  column: number,
  direction: Direction,
  clueAddresses: LabeledAddress[]
): Candidate | null =>
  findNext(
    crossword,
    row,
    column,
    direction,
    clueAddresses,
    (candidate) => !candidate.box.content
  );

export const advancedCursorSelector = selectorFamily<
  Address,
  {
    crosswordId: string;
  }
>({
  key: "cursor-after-advancement",
  get:
    (params) =>
    ({ get }) => {
      const crossword = get(arrayCrosswordSelector(params));
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
