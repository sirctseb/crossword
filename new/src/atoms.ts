import { atom } from "recoil";

export const cursorAtom = atom({
  key: "cursor",
  default: {
    row: 0,
    column: 0,
  },
});
