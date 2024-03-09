import type { Box, Crossword } from "../firebase/types";

export interface Address {
  row: number;
  column: number;
}
export interface Candidate extends Address {
  box: Box;
}
export interface LabeledAddress extends Address {
  label: number;
}
export type ArrayCrossword = Omit<
  Crossword,
  "boxes" | "clues" | "themeEntries"
> & {
  boxes: Box[][];
  clues: {
    across: Record<string, Record<string, string>>;
    down: Record<string, Record<string, string>>;
  };
  themeEntries: string[];
};

export type Direction = "across" | "down";

export interface LabeledAddressCatalog {
  across: LabeledAddress[];
  down: LabeledAddress[];
}
