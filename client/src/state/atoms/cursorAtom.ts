import { atom } from "jotai";
import { atomFamily } from "jotai/utils";

export interface Cursor {
  row: number;
  column: number;
  direction: "across" | "down";
}

export const cursorAtomFamily = atomFamily((crosswordId: string) =>
  atom<Cursor>({
    row: 0,
    column: 0,
    direction: "across",
  })
);
