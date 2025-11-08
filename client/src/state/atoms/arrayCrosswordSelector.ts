import { selectorFamily } from "recoil";
import { crosswordAtomFamily } from "../../firebase-recoil/atoms";
import { ArrayCrossword } from "../types";
import { deriveArrayCrossword } from "../derivations";

export const arrayCrosswordSelector = selectorFamily<
  ArrayCrossword,
  { crosswordId: string }
>({
  key: `crossword-retyped`,
  get:
    (param) =>
    async ({ get }) => {
      const crossword = get(crosswordAtomFamily(param));
      return deriveArrayCrossword(crossword);
    },
});
