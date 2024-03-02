import { useCallback } from "react";
import { useRecoilValue } from "recoil";

import { cursorAtom, arrayCrosswordFamily } from "../../../atoms";

type useIsCursorAnswerResult = (row: number, column: number) => boolean;

export const useIsCursorAnswer = (
  crosswordId: string
): useIsCursorAnswerResult => {
  // TODO or just take the crossword as an argument?
  // this is also making me think we put all of this in selectors
  const crossword = useRecoilValue(arrayCrosswordFamily({ crosswordId }));
  const cursor = useRecoilValue(cursorAtom);

  return useCallback(
    (row: number, column: number): boolean => {
      // TODO move the body below in here
      const box = crossword.boxes[cursor.row][cursor.column];
      if (box.blocked) return false;

      if (row === cursor.row && column === cursor.column) return true;

      if (cursor.direction === "across") {
        if (row !== cursor.row) {
          return false;
        }

        for (
          let increment = Math.sign(cursor.column - column),
            columnIter = column;
          columnIter >= 0 &&
          columnIter < crossword.rows &&
          !crossword.boxes[row][columnIter].blocked;
          columnIter += increment
        ) {
          if (columnIter === cursor.column) {
            return true;
          }
        }
        return false;
      }

      if (column !== cursor.column) {
        return false;
      }

      for (
        let increment = Math.sign(cursor.row - row), rowIter = row;
        rowIter >= 0 &&
        rowIter < crossword.rows &&
        !crossword.boxes[rowIter][column].blocked;
        rowIter += increment
      ) {
        if (rowIter === cursor.row) {
          return true;
        }
      }

      return false;
    },
    [crossword, cursor]
  );
};
