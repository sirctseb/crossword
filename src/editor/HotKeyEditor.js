import React from 'react';
import PropTypes from 'prop-types';
import { GlobalHotKeys } from 'react-hotkeys';

import UndoHistory from '../undo/UndoHistory';

const undoHistory = UndoHistory.getHistory('crossword');

const keyMap = {
  undo: 'meta+z',
  redo: 'shift+meta+z',
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
  toggleCursorDirection: ';',
};

export default (MyComponent) => {
  const HotKeyedEditor = (props) => {
    const {
      editor: {
        cursor: {
          row, column,
        },
      },
      size,
      isBlockedBox,
      actions: { toggleCursorDirection },
    } = props;

    const makeMoveCursor = vector => () => {
      // TODO there should be a selector for this
      if (!document.activeElement.classList.contains('box')) return;

      let rowIter = row;
      let columnIter = column;

      rowIter += vector[0];
      columnIter += vector[1];
      while (rowIter >= 0 && columnIter >= 0 && rowIter < size && columnIter < size) {
        if (!isBlockedBox(rowIter, columnIter)) {
          document.querySelector(`.box--at-${rowIter}-${columnIter}`).focus();
          return;
        }

        rowIter += vector[0];
        columnIter += vector[1];
      }
    };

    const right = makeMoveCursor([0, 1]);
    const left = makeMoveCursor([0, -1]);
    const up = makeMoveCursor([-1, 0]);
    const down = makeMoveCursor([1, 0]);

    const handlers = {
      undo: (evt) => {
        if (document.activeElement.tagName !== 'INPUT') {
          undoHistory.undo();
        }
        evt.preventDefault();
      },
      redo: (evt) => {
        if (document.activeElement.tagName !== 'INPUT') {
          undoHistory.redo();
        }
        evt.preventDefault();
      },
      up,
      down,
      left,
      right,
      toggleCursorDirection,
    };

    return <GlobalHotKeys allowChanges keyMap={keyMap} handlers={handlers}>
      <MyComponent {...props} />
    </GlobalHotKeys>;
  };

  HotKeyedEditor.propTypes = {
    editor: PropTypes.shape({
      cursor: PropTypes.shape({
        row: PropTypes.number.isRequired,
        column: PropTypes.number.isRequired,
      }),
    }),
    // TODO would like to be able to require these but this mounts
    // before the crossword is downloaded
    // TODO couldn't we just put it after the wait?
    size: PropTypes.number,
    isBlockedBox: PropTypes.func,
    actions: PropTypes.shape({
      toggleCursorDirection: PropTypes.func.isRequired,
    }).isRequired,
  };

  return HotKeyedEditor;
};
