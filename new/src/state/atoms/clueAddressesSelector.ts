import { selectorFamily } from "recoil";
import { arrayCrosswordSelector } from "..";
import { LabeledBox, type AddressCatalog } from "../types";
import { deriveClueAddresses } from "../derivations";

/**
 * Returns a map from directions to a list of boxes with their rows, columns, and labels
 */
export const clueAddressesSelector = selectorFamily<
  AddressCatalog,
  { crosswordId: string }
>({
  key: "clue-addresses",
  get:
    ({ crosswordId }) =>
    ({ get }) => {
      const crossword = get(arrayCrosswordSelector({ crosswordId }));
      return deriveClueAddresses(crossword);
    },
});
