import { get } from 'lodash';

export default {
  isFocusBox: (row, column, cursor) => row === cursor.row && column === cursor.column,
  isBlockedBox: (crossword, row, column) => !!get(crossword, `boxes.${row}.${column}.blocked`),
  newCrossword: () => ({ rows: 15, symmetric: true, title: 'untitled' }),
};
