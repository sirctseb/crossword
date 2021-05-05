import React from 'react';
import { Crossword } from '../firebase-recoil/data';

import Box from '../components/Box';

interface EditorProps {
  crossword: Crossword;
}

const emptyBox = {};

// stubbed
const isCursorAnswer = (row: number, column: number): boolean => false;
const makeUndoableChange = (path: string, oldValue: any, newValue: any): void => {};
const handleBlock = (row: number, column: number, blocked: boolean): void => {};
const handleBoxFocus = (coords: { row: number; column: number }): void => {};
const isCursorBox = (row: number, column: number): boolean => false;
const handleAfterSetContent = (content: string | null): void => {};

const Editor: React.FC<EditorProps> = ({ crossword }) => {
  const rows = [];
  for (let row = 0; row < crossword.rows; row += 1) {
    const boxes = [];
    for (let column = 0; column < crossword.rows; column += 1) {
      const box = crossword.boxes[row][column] || emptyBox;
      const label = 1; //labelMap[row][column];

      boxes.push(
        <Box
          key={`box-${row}-${column}`}
          cursorAnswer={isCursorAnswer(row, column)}
          row={row}
          column={column}
          box={box}
          makeUndoableChange={makeUndoableChange}
          clueLabel={label}
          onBlock={handleBlock}
          onBoxFocus={handleBoxFocus}
          cursor={isCursorBox(row, column)}
          onAfterSetContent={isCursorAnswer(row, column) ? handleAfterSetContent : null}
          // remoteCursors={remoteCursors?[row]?[column] || [])}
          remoteCursors={[]}
        />
      );
    }
    rows.push(
      <div className="editor__row" key={`row-${row}`}>
        {boxes}
      </div>
    );
  }
  return <div>{rows}</div>;
};

export default Editor;
