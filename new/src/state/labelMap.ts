import { selectorFamily } from "recoil";
import { arrayCrosswordFamily } from ".";
import { LabeledBox } from "./types";
import { deriveClueAddresses } from "./derivationFunctions";

export const test = { deriveClueAddresses };

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
      return deriveClueAddresses(crossword);
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
