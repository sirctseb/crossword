import UndoHistory from '../undo/UndoHistory';
import { ACROSS, DOWN } from './constants';

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

export default ({ row, column, direction }, size, isBlockedBox, setCursor) => {
  const makeMoveCursor = vector => () => {
    // TODO there should be a selector for this
    if (!document.activeElement.classList.contains('box')) return;

    let rowIter = row;
    let columnIter = column;

    rowIter += vector[0];
    columnIter += vector[1];
    while (rowIter >= 0 && columnIter >= 0 && rowIter < size && columnIter < size) {
      if (!isBlockedBox(rowIter, columnIter)) {
        // TODO might have to revisit this dom-first focus definition with more than one Editor
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
  const toggleCursorDirection = () => setCursor({
    row, column, direction: direction === ACROSS ? DOWN : ACROSS,
  });

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

  return { allowChanges: true, keyMap, handlers };
};
