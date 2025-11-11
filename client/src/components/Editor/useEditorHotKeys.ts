import { useHotkeys } from "react-hotkeys-hook";

import {
  cursorAtomFamily,
  type ArrayCrossword,
  type Cursor,
} from "../../state";
import { useAtom } from "jotai";
import { type UndoHistory } from "../../undo/UndoHistory";
import { useArrayCrossword } from "../firebase-hooks/hooks";

function moveCursor(
  vector: [number, number],
  crossword: ArrayCrossword,
  cursor: Cursor
): void {
  if (!document.activeElement?.classList.contains("box")) return;

  let { row, column } = cursor;

  const { rows: size } = crossword;

  row += vector[0];
  column += vector[1];
  while (row >= 0 && column >= 0 && row < size && column < size) {
    if (!crossword.boxes[row][column].blocked) {
      document
        .querySelector<HTMLDivElement>(`.box--at-${row}-${column}`)
        ?.focus();
      return;
    }

    row += vector[0];
    column += vector[1];
  }
}

// TODO add scoping to the editor being active
export const useEditorHotkeys = (
  crosswordId: string,
  undoHistory: UndoHistory
) => {
  const [cursor, setCursor] = useAtom(cursorAtomFamily(crosswordId));
  const { fallback: crossword } = useArrayCrossword(crosswordId);

  useHotkeys(
    ";",
    () => {
      setCursor((cursor) => ({
        ...cursor,
        direction: cursor.direction === "across" ? "down" : "across",
      }));
    },
    [setCursor]
  );

  // i think we should be able to put the crossword in a ref
  // and provide that to the hotkey handlers to avoid re-registering them
  useHotkeys("up", () => moveCursor([-1, 0], crossword, cursor), [
    crossword,
    cursor,
  ]);

  useHotkeys("down", () => moveCursor([1, 0], crossword, cursor), [
    crossword,
    cursor,
  ]);

  useHotkeys("left", () => moveCursor([0, -1], crossword, cursor), [
    crossword,
    cursor,
  ]);

  useHotkeys("right", () => moveCursor([0, 1], crossword, cursor), [
    crossword,
    cursor,
  ]);

  useHotkeys(
    "meta+z",
    (evt) => {
      if (document.activeElement?.tagName !== "INPUT") {
        undoHistory.undo();
      }
      evt.preventDefault();
    },
    [undoHistory]
  );

  useHotkeys("shift+meta+z", (evt) => {
    if (document.activeElement?.tagName !== "INPUT") {
      undoHistory.redo();
    }
    evt.preventDefault();
  });
};
