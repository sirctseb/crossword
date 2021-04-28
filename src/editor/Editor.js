import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose, bindActionCreators } from 'redux';
import { firebaseConnect } from 'react-redux-firebase';
import { get } from 'lodash';
import { bemNamesFactory } from 'bem-names';
import { GlobalHotKeys } from 'react-hotkeys';

import * as selectors from './selectors';
import * as suggestionsActions from '../suggestions/actions';
import { DOWN, ACROSS } from './constants';
import UndoHistory from '../undo/UndoHistory';
import FirebaseChange from '../undo/FirebaseChange';
import ClueList from './ClueList';
import Box from './Box';
import ThemeEntries from './themeEntries';
import Suggestions from './Suggestions';
import Wait from '../Wait';
import usePublishCursor from './usePublishCursor';
import useRemoteCursors from './cursors/useRemoteCursors';
import useEditorHotKeys from './useEditorHotKeys';
import calculateDerivedData from './derivations';

const enhance = compose(
  firebaseConnect(({ id }) => [`crosswords/${id}`]),
  connect(
    (state, props) =>
      selectors.getCrossword(state, props)
        ? {
            crossword: selectors.getCrossword(state, props),
          }
        : {
            loading: true,
          },
    (dispatch) => ({ actions: bindActionCreators(suggestionsActions, dispatch) })
  ),
  (C) => Wait(C, { toggle: ({ loading }) => !loading })
);

const blockedChange = (row, column, { rows, symmetric }, blocked, crosswordRef) => {
  const update = {
    [`boxes/${row}/${column}/blocked`]: blocked,
  };

  const undoUpdate = {
    [`boxes/${row}/${column}/blocked`]: !blocked,
  };

  if (symmetric) {
    update[`boxes/${rows - row - 1}/${rows - column - 1}/blocked`] = blocked;
    undoUpdate[`boxes/${rows - row - 1}/${rows - column - 1}/blocked`] = !blocked;
  }

  return new FirebaseChange(crosswordRef, update, undoUpdate);
};

const undoHistory = UndoHistory.getHistory('crossword');

const bem = bemNamesFactory('editor');

const emptyBox = {};

const Editor = ({
  crossword,
  firebase,
  firebase: { set },

  actions,

  showClues,
  showSuggestions,
  showThemeEntries,

  id: crosswordId,
}) => {
  // TODO this is not state. should be useRef
  const [fbRef] = useState(firebase.ref());
  const [cursor, setCursor] = useState({ row: 0, column: 0, direction: 'across' });
  const [clueInput, setClueInput] = useState({ row: 0, column: 0, direction: 'across', value: '' });

  const path = `crosswords/${crosswordId}`;

  const {
    cursorContent,
    cursorAfterAdvancement,
    acrossPattern,
    downPattern,
    isCursorAnswer,
    isCursorBox,
    labelMap,
    clueAddresses: { across: acrossClues, down: downClues },
    isBlockedBox,
    size,
    themeSuggestions,
    currentAnswers,
  } = calculateDerivedData(crossword, cursor);

  const makeUndoableChange = useCallback(
    (localPath, newValue, oldValue) => {
      undoHistory.add(FirebaseChange.FromValues(fbRef.child(`${path}/${localPath}`), newValue, oldValue));
    },
    [path]
  );

  const [cursorRef, publishCursor] = usePublishCursor(crosswordId);
  const handleBoxFocus = useCallback(
    (newCursor) => {
      // TODO so box only gives us {row, column}, and direction is undefined after this is called
      // so who's responsible for merging that in now? if we close over the direction value, then
      // we have to recompute this callback on direction change. fine i guess, but surprising.
      // but the alternative is to make the box merge in the direction? not the box's responsibility
      // so now we rerender every box on direction change. ok i guess. this wasn't a problem
      // with reducers
      setCursor({ direction: cursor.direction, ...newCursor });
      publishCursor(newCursor);
    },
    [crosswordId, cursorRef, cursor.direction]
  );

  const hotkeysProps = useEditorHotKeys(cursor, size, isBlockedBox, setCursor);

  // TODO revisit this optimization-by-nullifying
  // so yeah, naturally this would change every time the cursor moves.
  // why pass this to every box though? if a box doesn't have focus,
  // it'll obviously never be called.
  // FURTHERMORE, if we weren't precomputing the next cursor location
  // and grabbing it from the selector, this function wouldn't change anyway
  const handleAfterSetContent = useCallback(
    (newContent) => {
      if (newContent !== null) {
        const { row, column } = cursorAfterAdvancement;
        document.querySelector(`.box--at-${row}-${column}`).focus();
      }
    },
    [cursorAfterAdvancement.row, cursorAfterAdvancement.column]
  );

  // TODO as is obvious from the arguments to the actions, this should
  // be memoized on acrossPattern and downPattern
  useEffect(() => {
    actions.getSuggestions(acrossPattern);
    actions.getSuggestions(downPattern);
  }, [cursor.row, cursor.column, cursorContent]);

  const onClueBlur = () => {
    const { direction, row, column, value } = clueInput;

    undoHistory.add(
      FirebaseChange.FromValues(
        fbRef.child(`${path}/clues/${direction}/${row}/${column}`),
        value,
        get(crossword, `clues.${direction}.${row}.${column}`)
      )
    );
    setClueInput({
      value: null,
      row: null,
      column: null,
      direction: null,
    });
  };

  const handleBlock = useCallback(
    (row, column, blocked) => {
      undoHistory.add(blockedChange(row, column, crossword, blocked, fbRef.child(path)));
      // TODO should take rows and symmetric as params so we don't leak impl details here
    },
    [path, crossword.rows, crossword.symmetric]
  );

  const remoteCursors = useRemoteCursors(crosswordId, cursorRef);

  const rows = [];

  for (let row = 0; row < crossword.rows; row += 1) {
    const boxes = [];
    for (let column = 0; column < crossword.rows; column += 1) {
      const box = get(crossword, `boxes.${row}.${column}`, emptyBox);
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
          remoteCursors={get(remoteCursors, [row, column], [])}
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
    // TODO would love if hotkeys was pure hook
    <GlobalHotKeys {...hotkeysProps}>
      <div className={bem([`size-${crossword.rows}`])}>
        <input
          type="number"
          className="editor__input"
          value={crossword.rows}
          onChange={(evt) =>
            undoHistory.add(
              FirebaseChange.FromValues(fbRef.child(`${path}/rows`), parseInt(evt.target.value, 10), crossword.rows)
            )
          }
        />
        <input
          type="checkbox"
          className="editor__symmetric"
          checked={crossword.symmetric}
          onChange={(evt) => set(`${path}/symmetric`, evt.target.checked)}
        />
        <div className={bem('clues-and-grid')}>
          {showClues && (
            <div className={bem('clues-wrapper')}>
              <ClueList
                direction={ACROSS}
                clueLabels={acrossClues}
                clueData={get(crossword.clues, 'across', [])}
                clueInput={clueInput}
                onChangeClue={setClueInput}
                onClueBlur={onClueBlur}
              />
            </div>
          )}
          <div className={bem('grid')}>{rows}</div>
          {showClues && (
            <div className={bem('clues-wrapper')}>
              <ClueList
                direction={DOWN}
                clueLabels={downClues}
                clueData={get(crossword.clues, 'down', [])}
                clueInput={clueInput}
                onChangeClue={setClueInput}
                onClueBlur={onClueBlur}
              />
            </div>
          )}
        </div>
        {showSuggestions && (
          <Suggestions
            id={crosswordId}
            themeSuggestions={themeSuggestions}
            acrossPattern={acrossPattern}
            downPattern={downPattern}
          />
        )}
        {showThemeEntries && (
          <ThemeEntries
            fbRef={fbRef.child(path).child('themeEntries')}
            themeEntries={Object.keys(crossword.themeEntries || {})}
            currentAnswers={currentAnswers}
          />
        )}
      </div>
    </GlobalHotKeys>
  );
};

Editor.propTypes = {
  crossword: PropTypes.object.isRequired,
  showClues: PropTypes.bool,
  showSuggestions: PropTypes.bool,
  showThemeEntries: PropTypes.bool,
};

Editor.defaultProps = {
  showClues: true,
  showSuggestions: true,
  showThemeEntries: true,
};

export default enhance(Editor);
