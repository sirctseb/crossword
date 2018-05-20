import { get } from 'lodash';

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
};
