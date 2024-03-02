"use client";

import React, { useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import {
  arrayCrosswordFamily,
  labelMapSelector,
  cursorAtom,
  type ArrayCrossword,
  cursorAfterAdvancementSelector,
} from "../../state";

import { Box } from "./Box";
import { useIsCursorAnswer } from "./hooks/useIsCursorAnswer";

import "./editor.scss";
import { block } from "../../styles";
const bem = block("editor");

export interface EditorProps {
  crossword: ArrayCrossword;
  isCursorBox: (row: number, column: number) => boolean;
  isCursorAnswer: (row: number, column: number) => boolean;
  onBoxFocus: (row: number, column: number) => void;
  labelMap: Record<number, Record<number, number>>;
  onAfterSetContent: (newContent: string | null) => void;
}

const emptyBox = {};

export const Editor: React.FC<EditorProps> = ({
  crossword,
  isCursorBox,
  isCursorAnswer,
  onBoxFocus,
  labelMap,
  onAfterSetContent,
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
          // makeUndoableChange={this.makeUndoableChange}
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
  const crossword = useRecoilValue(arrayCrosswordFamily({ crosswordId }));
  const [cursor, setCursor] = useRecoilState(cursorAtom);
  const labelMap = useRecoilValue(labelMapSelector({ crosswordId }));
  const cursorAfterAdvancement = useRecoilValue(
    cursorAfterAdvancementSelector({ crosswordId })
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

  return (
    <Editor
      crossword={crossword}
      isCursorBox={isCursorBox}
      onBoxFocus={handleBoxFocus}
      isCursorAnswer={isCursorAnswer}
      labelMap={labelMap}
      onAfterSetContent={handleAfterSetContent}
    />
  );
};
