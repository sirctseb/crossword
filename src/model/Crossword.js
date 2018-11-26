import { get, range, flatten } from 'lodash';
import { ACROSS } from '../editor/constants';

export default {
  isCursorAnswer: (row, column, box, crossword, cursor) => {
    if (box.blocked) return false;
    if (row === cursor.row && column === cursor.column) return true;

    if (cursor.direction === ACROSS) {
      if (row !== cursor.row) {
        return false;
      }

      for (let increment = Math.sign(cursor.column - column), columnIter = column;
        columnIter >= 0 && columnIter < crossword.rows && !get(crossword, `boxes.${row}.${columnIter}.blocked`);
        columnIter += increment) {
        if (columnIter === cursor.column) {
          return true;
        }
      }
      return false;
    }

    if (column !== cursor.column) {
      return false;
    }

    for (let increment = Math.sign(cursor.row - row), rowIter = row;
      rowIter >= 0 && rowIter < crossword.rows && !get(crossword, `boxes.${rowIter}.${column}.blocked`);
      rowIter += increment) {
      if (rowIter === cursor.row) {
        return true;
      }
    }
    return false;
  },
  isFocusBox: (row, column, cursor) => row === cursor.row && column === cursor.column,
  isBlockedBox: (crossword, row, column) => !!get(crossword, `boxes.${row}.${column}.blocked`),
  completeAnswers: (crossword) => {
    const MISSING_VALUE = { blocked: true };
    const coordsToSignifier = (row, column) => {
      const { content, blocked } = get(crossword, `boxes.${row}.${column}`, MISSING_VALUE);
      return blocked ? '|' : (content || '.');
    };
    const lineToAnswers = line =>
      line.join('')
        .split('|')
        .filter(answer => answer.length > 0)
        .filter(answer => !answer.includes('.'));
    return flatten(range(crossword.rows).map(row =>
      [
        ...lineToAnswers(range(crossword.rows)
          .map(column => coordsToSignifier(row, column))),
        ...lineToAnswers(range(crossword.rows)
          .map(column => coordsToSignifier(column, row))),
      ]));
  },
  newCrossword: () => ({ rows: 15, symmetric: true, title: 'untitled' }),
};
