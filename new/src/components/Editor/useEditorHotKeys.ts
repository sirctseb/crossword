import { useHotkeys } from "react-hotkeys-hook";

import {
  arrayCrosswordSelector,
  cursorAtom,
  type ArrayCrossword,
  type Cursor,
} from "../../state";
import { useRecoilState, useRecoilValue } from "recoil";
import { type UndoHistory } from "../../undo/UndoHistory";

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
  const [cursor, setCursor] = useRecoilState(cursorAtom);
  const crossword = useRecoilValue(arrayCrosswordSelector({ crosswordId }));

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
