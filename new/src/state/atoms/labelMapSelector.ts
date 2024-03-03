import { selectorFamily } from "recoil";
import { clueAddressesSelector } from "./clueAddressesSelector";

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
