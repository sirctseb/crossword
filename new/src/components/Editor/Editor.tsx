"use client";

import React, { useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { cursorAtom, arrayCrosswordFamily } from "../../atoms";
import type { ArrayCrossword } from "../../firebase-recoil/atoms";

import { block } from "../../styles";
import { Box } from "./Box";

import "./editor.scss";
import { useIsCursorAnswer } from "./hooks/useIsCursorAnswer";
const bem = block("editor");

export interface EditorProps {
  crossword: ArrayCrossword;
  isCursorBox: (row: number, column: number) => boolean;
  isCursorAnswer: (row: number, column: number) => boolean;
  onBoxFocus: (row: number, column: number) => void;
}

const emptyBox = {};

export const Editor: React.FC<EditorProps> = ({
  crossword,
  isCursorBox,
  isCursorAnswer,
  onBoxFocus,
}) => {
  const rows = [];

  for (let row = 0; row < crossword.rows; row += 1) {
    const boxes = [];
    for (let column = 0; column < crossword.rows; column += 1) {
      const box = crossword.boxes[row][column] || emptyBox;
      // const label = labelMap[row][column];

      boxes.push(
        <Box
          key={`box-${row}-${column}`}
          cursorAnswer={isCursorAnswer(row, column)}
          row={row}
          column={column}
          box={box}
          // makeUndoableChange={this.makeUndoableChange}
          makeUndoableChange={() => {}}
          // clueLabel={label}
          // onBlock={this.onBlock}
          onBlock={() => {}}
          onBoxFocus={onBoxFocus}
          cursor={isCursorBox(row, column)}
          // onAfterSetContent={this.handleAfterSetContent}
          onAfterSetContent={() => {}}
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
  const crossword = useRecoilValue(arrayCrosswordFamily({ crosswordId }));
  const [cursor, setCursor] = useRecoilState(cursorAtom);

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

  return (
    <Editor
      crossword={crossword}
      isCursorBox={isCursorBox}
      onBoxFocus={handleBoxFocus}
      isCursorAnswer={isCursorAnswer}
    />
  );
};
