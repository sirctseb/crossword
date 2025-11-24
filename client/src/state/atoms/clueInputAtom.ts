import { atom } from "jotai";

export interface ClueInput {
  row: number;
  column: number;
  value: string | null;
  direction: "across" | "down";
}

// Atom to track the current clue input state. We have on global atom for any clue input
// because it is captures the state of an edit to an input element, so there can only be
// one at a time.
// The state captures the fields needed to address the clue (row, column, direction) in the
// data model, and the value the user has entered.
// If no clue is being edited, the value is null.
export const clueInputAtom = atom<ClueInput | null>({
  row: 0,
  column: 0,
  value: null,
  direction: "across",
});
