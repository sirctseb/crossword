import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose, bindActionCreators } from 'redux';
import { firebaseConnect } from 'react-redux-firebase';
import { withRouter } from 'react-router-dom';
import { get } from 'lodash';
import { bemNamesFactory } from 'bem-names';

import * as selectors from './selectors';
import * as editorActions from './actions';
import { DOWN, ACROSS } from './constants';
import UndoHistory from '../undo/UndoHistory';
import FirebaseChange from '../undo/FirebaseChange';
import ClueList from './ClueList';
import Box from './Box';
import withEditorHotKeys from './withEditorHotKeys';
import ThemeEntries from './themeEntries';
import Suggestions from './Suggestions';
import Wait from '../Wait';
import withPublishedCursor from './withPublishedCursor';

const enhance = compose(
  withRouter,
  firebaseConnect(props => ([
    `crosswords/${props.match.params.crosswordId}`,
  ])),
  connect(
    (state, { match: { params: props } }) =>
      (selectors.getCrossword(state, props) ?
        ({
          crossword: selectors.getCrossword(state, props),
          acrossPattern: selectors.getAcrossPattern(state, props),
          downPattern: selectors.getDownPattern(state, props),
          path: `crosswords/${props.crosswordId}`,
          editor: state.editor,
          size: selectors.getSize(state, props),
          cursorContent: selectors.getCursorContent(state, props),
          isCursorAnswer: selectors.getIsCursorAnswer(state, props),
          isCursorBox: selectors.getIsCursorBox(state, props),
          isBlockedBox: selectors.getIsBlockedBox(state, props),
          cursorAfterAdvancement: selectors.getCursorAfterAdvancement(state, props),
          clueAddresses: selectors.getClueAddresses(state, props),
          labelMap: selectors.getLabelMap(state, props),
        }) :
        ({
          loading: true,
        })),
    dispatch => ({ actions: bindActionCreators(editorActions, dispatch) }),
  ),
  C => Wait(C, { toggle: ({ loading }) => !loading }),
  withPublishedCursor,
  withEditorHotKeys,
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
  editor,
  firebase,
  firebase: { set },
  path,
  cursorContent,
  cursorAfterAdvancement,
  acrossPattern,
  downPattern,
  actions,
  isCursorAnswer,
  isCursorBox,
  labelMap,
  onBoxFocus,
  clueAddresses: { across: acrossClues, down: downClues },
}) => {
  const [fbRef] = useState(firebase.ref());

  const makeUndoableChange = useCallback((localPath, newValue, oldValue) => {
    undoHistory.add(FirebaseChange.FromValues(
      fbRef.child(`${path}/${localPath}`),
      newValue,
      oldValue,
    ));
  }, [path]);

  // TODO revisit this optimization-by-nullifying
  // so yeah, naturally this would change every time the cursor moves.
  // why pass this to every box though? if a box doesn't have focus,
  // it'll obviously never be called.
  // FURTHERMORE, if we weren't precomputing the next cursor location
  // and grabbing it from the selector, this function wouldn't change anyway
  const handleAfterSetContent = useCallback((newContent) => {
    if (newContent !== null) {
      const { row, column } = cursorAfterAdvancement;
      document.querySelector(`.box--at-${row}-${column}`).focus();
    }
  }, [cursorAfterAdvancement.row, cursorAfterAdvancement.column]);

  useEffect(() => {
    actions.getSuggestions(acrossPattern);
    actions.getSuggestions(downPattern);
  }, [editor.cursor.row, editor.cursor.column, cursorContent]);

  const onClueBlur = () => {
    const {
      clueInput: {
        direction, row, column, value,
      },
    } = editor;

    undoHistory.add(FirebaseChange.FromValues(
      fbRef.child(`${path}/clues/${direction}/${row}/${column}`),
      value,
      get(crossword, `clues.${direction}.${row}.${column}`),
    ));
    actions.changeClue({
      value: null,
      row: null,
      column: null,
      direction: null,
    });
  };

  const handleBlock = useCallback((row, column, blocked) => {
    undoHistory.add(blockedChange(
      row,
      column,
      crossword,
      blocked,
      fbRef.child(path),
    ));
    // TODO should take rows and symmetric as params so we don't leak impl details here
  }, [path, crossword.rows, crossword.symmetric]);

  const rows = [];

  for (let row = 0; row < crossword.rows; row += 1) {
    const boxes = [];
    for (let column = 0; column < crossword.rows; column += 1) {
      const box = get(crossword, `boxes.${row}.${column}`, emptyBox);
      const label = labelMap[row][column];

      boxes.push((
        <Box key={`box-${row}-${column}`}
          cursorAnswer={isCursorAnswer(row, column)}
          row={row}
          column={column}
          box={box}
          makeUndoableChange={makeUndoableChange}
          clueLabel={label}
          onBlock={handleBlock}
          onBoxFocus={onBoxFocus}
          cursor={isCursorBox(row, column)}
          onAfterSetContent={isCursorAnswer(row, column) ? handleAfterSetContent : null}
        />
      ));
    }
    rows.push((
      <div className='editor__row'
        key={`row-${row}`}>
        {boxes}
      </div>
    ));
  }

  return (
    <div className={bem([`size-${crossword.rows}`])}>
      <input type='number'
        className='editor__input'
        value={crossword.rows}
        onChange={evt =>
          undoHistory.add(FirebaseChange.FromValues(
            fbRef.child(`${path}/rows`),
            parseInt(evt.target.value, 10),
            crossword.rows,
          ))} />
      <input type='checkbox'
        className='editor__symmetric'
        checked={crossword.symmetric}
        onChange={evt => set(`${path}/symmetric`, evt.target.checked)} />
      <div className={bem('clues-and-grid')}>
        <div className={bem('clues-wrapper')}>
          <ClueList direction={ACROSS}
            clueLabels={acrossClues}
            clueData={get(crossword.clues, 'across', [])}
            clueInput={editor.clueInput}
            actions={actions}
            onClueBlur={onClueBlur} />
        </div>
        <div className={bem('grid')}>
          {rows}
        </div>
        <div className={bem('clues-wrapper')}>
          <ClueList direction={DOWN}
            clueLabels={downClues}
            clueData={get(crossword.clues, 'down', [])}
            clueInput={editor.clueInput}
            actions={actions}
            onClueBlur={onClueBlur} />
        </div>
      </div>
      <Suggestions />
      <ThemeEntries fbRef={fbRef.child(path).child('themeEntries')} />
      <button onClick={() => undoHistory.undo()}>Undo</button>
      <button onClick={() => undoHistory.redo()}>Redo</button>
    </div>
  );
};

Editor.propTypes = {
  crossword: PropTypes.object.isRequired,
  acrossPattern: PropTypes.string.isRequired,
  downPattern: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  editor: PropTypes.object.isRequired,
  isCursorAnswer: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  isCursorBox: PropTypes.func.isRequired,
  cursorContent: PropTypes.string,
  cursorAfterAdvancement: PropTypes.object.isRequired,
  clueAddresses: PropTypes.object.isRequired,
  labelMap: PropTypes.object.isRequired,
  onBoxFocus: PropTypes.func.isRequired,
};

export default enhance(Editor);
