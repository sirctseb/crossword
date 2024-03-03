"use client";

import React, { useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import {
  arrayCrosswordSelector,
  labelMapSelector,
  cursorAtom,
  type ArrayCrossword,
  advancedCursorSelector,
} from "../../state";
import UndoHistory from "../../undo/UndoHistory";

import { Box as BoxModel } from "../../firebase/types";

import { Box } from "./Box";
import { useIsCursorAnswer } from "./hooks/useIsCursorAnswer";

import "./editor.scss";
import { block } from "../../styles";
import { FirebaseUpdate } from "../../undo/FirebaseChange";
import { ref } from "firebase/database";
import { getFirebaseDatabase } from "../../firebase";
const bem = block("editor");

export interface EditorProps {
  crossword: ArrayCrossword;
  isCursorBox: (row: number, column: number) => boolean;
  isCursorAnswer: (row: number, column: number) => boolean;
  onBoxFocus: (row: number, column: number) => void;
  labelMap: Record<number, Record<number, number>>;
  onAfterSetContent: (newContent: string | null) => void;
  // onModifyBox: (row: number, column: number, box: Partial<BoxModel>) => void;
  onModifyBox: <K extends keyof BoxModel>(
    row: number,
    column: number,
    key: K,
    value: BoxModel[K]
  ) => void;
}

const emptyBox = {};

const undoHistory = UndoHistory.getHistory("crossword");

export const Editor: React.FC<EditorProps> = ({
  crossword,
  isCursorBox,
  isCursorAnswer,
  onBoxFocus,
  labelMap,
  onAfterSetContent,
  onModifyBox,
}) => {
  const rows = [];

  for (let row = 0; row < crossword.rows; row += 1) {
    const boxes = [];
    for (let column = 0; column < crossword.rows; column += 1) {
      const box = crossword.boxes[row][column] || emptyBox;
      const label = labelMap[row][column];

      boxes.push(
        <Box
          key={`box-${row}-${column}`}
          cursorAnswer={isCursorAnswer(row, column)}
          row={row}
          column={column}
          box={box}
          onModifyBox={onModifyBox}
          makeUndoableChange={() => {}}
          clueLabel={label}
          // onBlock={this.onBlock}
          onBlock={() => {}}
          onBoxFocus={onBoxFocus}
          cursor={isCursorBox(row, column)}
          onAfterSetContent={onAfterSetContent}
        />
      );
    }
    rows.push(
      <div className="editor__row" key={`row-${row}`}>
        {boxes}
      </div>
    );
  }
  return (
    <div className={bem({ [`size-${crossword.rows}`]: true })}>
      <div className={bem("grid")}>{rows}</div>
    </div>
  );
};

export interface ConnectedEditorProps {
  crosswordId: string;
}

export const ConnectedEditor: React.FC<ConnectedEditorProps> = ({
  crosswordId,
}) => {
  const crossword = useRecoilValue(arrayCrosswordSelector({ crosswordId }));
  const [cursor, setCursor] = useRecoilState(cursorAtom);
  const labelMap = useRecoilValue(labelMapSelector({ crosswordId }));
  const cursorAfterAdvancement = useRecoilValue(
    advancedCursorSelector({ crosswordId })
  );

  const isCursorBox = useCallback(
    (row: number, column: number): boolean => {
      return cursor.row === row && cursor.column === column;
    },
    [cursor]
  );

  const isCursorAnswer = useIsCursorAnswer(crosswordId);

  const handleBoxFocus = useCallback(
    (row: number, column: number) => {
      setCursor(({ direction }) => ({
        direction,
        row,
        column,
      }));
    },
    [setCursor]
  );

  const handleAfterSetContent = useCallback(
    (newContent: string | null) => {
      if (newContent !== null) {
        const { row, column } = cursorAfterAdvancement;
        const className = `.box--at-${row}-${column}`;
        const toFocus = document.querySelector<HTMLDivElement>(className);
        if (!toFocus) {
          throw new Error(
            `Could not find box to focus (${row}, ${column}) (${className})`
          );
        }
        toFocus.focus();
      }
    },
    [cursorAfterAdvancement]
  );

  const handleModifyBox = useCallback(
    <K extends keyof BoxModel>(
      row: number,
      column: number,
      key: K,
      value: BoxModel[K]
    ) => {
      undoHistory.add(
        new FirebaseUpdate(
          ref(
            getFirebaseDatabase(),
            `crosswords/${crosswordId}/boxes/${row}/${column}`
          ),
          { [key]: value },
          { [key]: crossword.boxes[row][column][key] }
        )
      );
    },
    [crossword.boxes, crosswordId]
  );

  return (
    <Editor
      crossword={crossword}
      isCursorBox={isCursorBox}
      onBoxFocus={handleBoxFocus}
      isCursorAnswer={isCursorAnswer}
      labelMap={labelMap}
      onAfterSetContent={handleAfterSetContent}
      onModifyBox={handleModifyBox}
    />
  );
};
