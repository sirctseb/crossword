import { atomFamily } from "recoil";

export interface Cursor {
  row: number;
  column: number;
  direction: "across" | "down";
}

export const cursorAtomFamily = atomFamily<Cursor, { crosswordId: string }>({
  key: "cursor",
  default: {
    row: 0,
    column: 0,
    direction: "across",
  },
});
