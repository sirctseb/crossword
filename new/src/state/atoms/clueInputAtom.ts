import { atom } from "recoil";

export interface ClueInput {
  row: number;
  column: number;
  value: string | null;
  direction: "across" | "down";
}

export const clueInputAtom = atom<ClueInput>({
  key: "clue-input",
  default: {
    row: 0,
    column: 0,
    value: null,
    direction: "across",
  },
});
