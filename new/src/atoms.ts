import { atom } from "recoil";

interface Cursor {
  row: number;
  column: number;
  direction: "across" | "down";
}

export const cursorAtom = atom<Cursor>({
  key: "cursor",
  default: {
    row: 0,
    column: 0,
    direction: "across",
  },
});
