import React from "react";

import type { ArrayCrossword } from "../../firebase-recoil/atoms";
import { block } from "../../styles";
import { Box } from "./Box";
const bem = block("editor");

export interface EditorProps {
  crossword: ArrayCrossword;
}

const emptyBox = {};

export const Editor: React.FC<EditorProps> = ({ crossword }) => {
  const rows = [];

  for (let row = 0; row < crossword.rows; row += 1) {
    const boxes = [];
    for (let column = 0; column < crossword.rows; column += 1) {
      const box = crossword.boxes[row][column] || emptyBox;
      // const label = labelMap[row][column];

      boxes.push(
        <Box
          key={`box-${row}-${column}`}
          // cursorAnswer={isCursorAnswer(row, column)}
          cursorAnswer={false}
          row={row}
          column={column}
          box={box}
          // makeUndoableChange={this.makeUndoableChange}
          makeUndoableChange={() => {}}
          // clueLabel={label}
          // onBlock={this.onBlock}
          onBlock={() => {}}
          // onBoxFocus={this.onBoxFocus}
          onBoxFocus={() => {}}
          // cursor={isCursorBox(row, column)}
          cursor={false}
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
