import React, { useState } from 'react';
import cn from 'classnames';
import derivations from './editor/derivations';
import { Crossword, Direction } from '../firebase-recoil/data';

import Box from '../components/Box';

interface EditorProps {
  crossword: Crossword;
  showClues?: boolean;
  showSuggestions?: boolean;
  showThemeEntries?: boolean;
}

interface Cursor {
  row: number;
  column: number;
  direction: Direction;
}

import styles from './Editor.module.scss';
import ClueList, { ClueValue } from './ClueList';
import Suggestions from './Suggestions';

const emptyBox = {};

// stubbed
const makeUndoableChange = (path: string, oldValue: any, newValue: any): void => {};
const handleBlock = (row: number, column: number, blocked: boolean): void => {};
const handleBoxFocus = (coords: { row: number; column: number }): void => {};
const handleAfterSetContent = (content: string | null): void => {};

const Editor: React.FC<EditorProps> = ({
  crossword,
  showClues = true,
  showSuggestions = true,
  showThemeEntries = true,
}) => {
  const [cursor, setCursor] = useState<Cursor>({ row: 0, column: 0, direction: Direction.across });
  const [clueInput, setClueInput] = useState<ClueValue>({ row: 0, column: 0, direction: Direction.across, value: '' });

  const {
    isCursorAnswer,
    isCursorBox,
    labelMap,
    clueAddresses: { across: acrossClues, down: downClues },
    themeSuggestions,
    acrossPattern,
    downPattern,
  } = derivations(crossword, cursor);

  const onClueBlur = () => {
    const { direction, row, column, value } = clueInput;

    // undoHistory.add(
    //   FirebaseChange.FromValues(
    //     fbRef.child(`${path}/clues/${direction}/${row}/${column}`),
    //     value,
    //     get(crossword, `clues.${direction}.${row}.${column}`)
    //   )
    // );

    setClueInput({
      value: null,
      row: null,
      column: null,
      direction: null,
    });
  };

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
      <div className={styles.row} key={`row-${row}`}>
        {boxes}
      </div>
    );
  }
  return (
    <div className={cn(styles.editor, styles[`size${crossword.rows}`])}>
      <input
        type="number"
        value={crossword.rows}
        onChange={
          (evt) => null
          // undoHistory.add(
          //   FirebaseChange.FromValues(fbRef.child(`${path}/rows`), parseInt(evt.target.value, 10), crossword.rows)
          // )
        }
      />
      <input
        type="checkbox"
        checked={crossword.symmetric}
        onChange={
          (evt) => null
          // set(`${path}/symmetric`, evt.target.checked)
        }
      />
      <div className={styles.cluesAndGrid}>
        {showClues && (
          <div className={styles.cluesWrapper}>
            <ClueList
              direction={Direction.across}
              clueLabels={acrossClues}
              clueData={crossword.clues?.across || []}
              clueInput={clueInput}
              onChangeClue={setClueInput}
              onClueBlur={onClueBlur}
            />
          </div>
        )}
        <div className={styles.grid}>{rows}</div>
        {showClues && (
          <div className={styles.cluesWrapper}>
            <ClueList
              direction={Direction.down}
              clueLabels={downClues}
              clueData={crossword.clues?.down || []}
              clueInput={clueInput}
              onChangeClue={setClueInput}
              onClueBlur={onClueBlur}
            />
          </div>
        )}
      </div>
      {showSuggestions && (
        <Suggestions theme={themeSuggestions} acrossPattern={acrossPattern} downPattern={downPattern} />
      )}
      {
        showThemeEntries && null
        // <ThemeEntries
        //   fbRef={fbRef.child(path).child('themeEntries')}
        //   themeEntries={Object.keys(crossword.themeEntries || {})}
        //   currentAnswers={currentAnswers}
        // />
      }
    </div>
  );
};

export default Editor;
