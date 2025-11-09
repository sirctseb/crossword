import { atom } from "jotai";

export interface ClueInput {
  row: number;
  column: number;
  value: string | null;
  direction: "across" | "down";
}

export const clueInputAtom = atom<ClueInput>({
  row: 0,
  column: 0,
  value: null,
  direction: "across",
});
