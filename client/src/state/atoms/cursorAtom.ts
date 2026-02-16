import { atom } from "jotai";
import { atomFamily } from "jotai/utils";

export interface Cursor {
  row: number;
  column: number;
  direction: "across" | "down";
}

export const cursorAtomFamily = atomFamily((crosswordId: string) => {
  const cursorAtom = atom<Cursor | null>(null);
  cursorAtom.onMount = (setAtom) => {
    const handler = () => {
      if (
        document.activeElement === document.body ||
        document.activeElement === null
      ) {
        setAtom(null);
      }
    };
    window.addEventListener("blur", handler, { capture: true });
    return () => {
      window.removeEventListener("blur", handler, { capture: true });
    };
  };
  return cursorAtom;
});
