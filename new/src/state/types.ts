import type { Box, Crossword } from "../firebase/types";

export interface Address {
  row: number;
  column: number;
}
export interface Candidate extends Address {
  box: Box;
}
export interface LabeledBox {
  row: number;
  column: number;
  label: number;
}
export type ArrayCrossword = Omit<Crossword, "boxes"> & { boxes: Box[][] };

export type Direction = "across" | "down";

export interface AddressCatalog {
  across: LabeledBox[];
  down: LabeledBox[];
}
