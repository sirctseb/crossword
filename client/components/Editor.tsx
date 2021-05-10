import React, { useState } from 'react';
import derivations from './editor/derivations';
import { Crossword, Direction } from '../firebase-recoil/data';

import Box from '../components/Box';

interface EditorProps {
  crossword: Crossword;
}

interface Cursor {
  row: number;
  column: number;
  direction: Direction;
}

const emptyBox = {};

// stubbed
const makeUndoableChange = (path: string, oldValue: any, newValue: any): void => {};
const handleBlock = (row: number, column: number, blocked: boolean): void => {};
const handleBoxFocus = (coords: { row: number; column: number }): void => {};
const handleAfterSetContent = (content: string | null): void => {};

const Editor: React.FC<EditorProps> = ({ crossword }) => {
  const [cursor, setCursor] = useState<Cursor>({ row: 0, column: 0, direction: Direction.across });

  const { isCursorAnswer, isCursorBox, labelMap } = derivations(crossword, cursor);

  const rows = [];
  for (let row = 0; row < crossword.rows; row += 1) {
    const boxes = [];
    for (let column = 0; column < crossword.rows; column += 1) {
      const box = crossword.boxes?.[row]?.[column] || emptyBox;
      const label = labelMap[row][column];

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
