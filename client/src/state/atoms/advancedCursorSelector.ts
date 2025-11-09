import { selectorFamily } from "recoil";
import { Address, Direction } from "../types";
import { findNextBlank } from "../derivations";
import { arrayCrosswordSelector } from "./arrayCrosswordSelector";
import { clueAddressesSelector } from "./clueAddressesSelector";

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
      const { row, column, direction } = {
        row: 0,
        column: 0,
        direction: "across" as Direction,
      };
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
