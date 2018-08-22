import { get } from 'lodash';
import { ACROSS } from '../editor/constants';

export default {
  acrossPattern: (crossword, row, column) => {
    const across = [];
    for (let i = column; i >= 0 && !get(crossword, `boxes.${row}.${i}.blocked`); i -= 1) {
      across.push(get(crossword, `boxes.${row}.${i}.content`, '.'));
    }
    across.reverse();
    for (let i = column + 1; i < crossword.rows && !get(crossword, `boxes.${row}.${i}.blocked`); i += 1) {
      across.push(get(crossword, `boxes.${row}.${i}.content`, '.'));
    }
    return across.join('');
  },
  downPattern: (crossword, row, column) => {
    const down = [];
    for (let i = row; i >= 0 && !get(crossword, `boxes.${i}.${crossword}.blocked`); i -= 1) {
      down.push(get(crossword, `boxes.${i}.${column}.content`, '.'));
    }
    down.reverse();
    for (let i = row + 1; i < crossword.rows && !get(crossword, `boxes.${i}.${column}.blocked`); i += 1) {
      down.push(get(crossword, `boxes.${i}.${column}.content`, '.'));
    }
    return down.join('');
  },
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
};
