import { get, flatten, range } from 'lodash';
import { ACROSS, DOWN } from './constants';

const calculateAcrossPattern = ({ row, column }, crossword) => {
  const across = [];
  for (let i = column; i >= 0 && !get(crossword, `boxes.${row}.${i}.blocked`); i -= 1) {
    across.push(get(crossword, `boxes.${row}.${i}.content`, '.'));
  }
  across.reverse();
  for (let i = column + 1; i < crossword.rows && !get(crossword, `boxes.${row}.${i}.blocked`); i += 1) {
    across.push(get(crossword, `boxes.${row}.${i}.content`, '.'));
  }
  return `^${across.join('')}$`;
};

const calculateDownPattern = ({ row, column }, crossword) => {
  const down = [];
  for (let i = row; i >= 0 && !get(crossword, `boxes.${i}.${column}.blocked`); i -= 1) {
    down.push(get(crossword, `boxes.${i}.${column}.content`, '.'));
  }
  down.reverse();
  for (let i = row + 1; i < crossword.rows && !get(crossword, `boxes.${i}.${column}.blocked`); i += 1) {
    down.push(get(crossword, `boxes.${i}.${column}.content`, '.'));
  }
  return `^${down.join('')}$`;
};

const calculateThemeSuggestions = (themeEntries, acrossPattern, downPattern) => ({
  across: [...themeEntries.filter(entry => entry.match(acrossPattern))],
  down: [...themeEntries.filter(entry => entry.match(downPattern))],
});

const calculateCurrentAnswers = (crossword) => {
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
};

const calculateIsCursorAnswer = (crossword, cursor) => (row, column) => {
  const box = get(crossword, `boxes.${row}.${column}`) || {};
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
};

/**
 * Returns a map from directions to a list of boxes with their rows, columns, and labels
 * {
 *   [across|down]: [
 *     {
 *       row, column, label
 *     }
 *   ],
 * }
 */
const calculateClueAddresses = (crossword) => {
  const addresses = {
    across: [],
    down: [],
  };
  let clueIndex = 1;
  for (let row = 0; row < crossword.rows; row += 1) {
    for (let column = 0; column < crossword.rows; column += 1) {
      const blocked = get(crossword, `boxes.${row}.${column}.blocked`);
      const leftBlocked = column === 0 ||
        get(crossword, `boxes.${row}.${column - 1}.blocked`);
      const topBlocked = row === 0 ||
        get(crossword, `boxes.${row - 1}.${column}.blocked`);
      const indexBox = !blocked && (leftBlocked || topBlocked);
      if (indexBox && leftBlocked) {
        addresses.across.push({ row, column, label: clueIndex });
      }
      if (indexBox && topBlocked) {
        addresses.down.push({ row, column, label: clueIndex });
      }
      if (indexBox) {
        clueIndex += 1;
      }
    }
  }
  return addresses;
};


/**
 * Returns a map from row to column to the label at that square
 */
const calculateLabelMap = (addresses) => {
  const map = {};
  [ACROSS, DOWN].forEach((direction) => {
    addresses[direction].forEach((address) => {
      map[address.row] = map[address.row] || {};
      map[address.row][address.column] = address.label;
    });
  });
  return map;
};

// All the of rest are in service of calculateCursorAfterAdvancement

const firstBoxAddress = (crossword, row, column, direction) => {
  const columnChange = direction === ACROSS ? -1 : 0;
  const rowChange = direction === ACROSS ? 0 : -1;

  let rowIter = row;
  let columnIter = column;
  while ((rowIter + rowChange >= 0) && (columnIter + columnChange >= 0) && !get(crossword, ['boxes', rowIter + rowChange, columnIter + columnChange, 'blocked'])) {
    columnIter += columnChange;
    rowIter += rowChange;
  }
  return { row: rowIter, column: columnIter };
};

/**
 * The address of the labeled box of the answer that contains the given row/column
 */
const clueAddressAt = (crossword, row, column, direction, clueAddresses) => {
  const firstAddress = firstBoxAddress(crossword, row, column, direction);
  return clueAddresses.find(address =>
    address.row === firstAddress.row && address.column === firstAddress.column);
};

const notBlocked = (crossword, row, column) => !get(crossword, ['boxes', row, column, 'blocked']);
const isAt = (address, row, column) => address.row === row && address.column === column;
const boxAt = (crossword, row, column) => get(crossword, ['boxes', row, column], {});
const candidateAt = (crossword, row, column) => ({
  row, column, box: boxAt(crossword, row, column),
});

const cycleInAnswerDown = (crossword, row, column) => {
  if ((row + 1) < crossword.rows && notBlocked(crossword, row + 1, column)) {
    return candidateAt(crossword, row + 1, column);
  }
  let rowIter = row;
  while (rowIter - 1 >= 0 && notBlocked(crossword, rowIter - 1, column)) {
    rowIter -= 1;
  }
  return candidateAt(crossword, rowIter, column);
};

const cycleInAnswerAcross = (crossword, row, column) => {
  if ((column + 1) < crossword.rows && notBlocked(crossword, row, column + 1)) {
    return candidateAt(crossword, row, column + 1);
  }
  let columnIter = column;
  while (columnIter - 1 >= 0 && notBlocked(crossword, row, columnIter - 1)) {
    columnIter -= 1;
  }
  return candidateAt(crossword, row, columnIter);
};

const cyclers = {
  across: cycleInAnswerAcross,
  down: cycleInAnswerDown,
};

const cycleInAnswer = (crossword, row, column, direction) =>
  cyclers[direction](crossword, row, column);

const findInCycle = (crossword, row, column, direction, where) => {
  let candidate = candidateAt(crossword, row, column);
  if (where(candidate)) return candidate;

  const reached = { [`${row}-${column}`]: true };
  candidate = cycleInAnswer(crossword, candidate.row, candidate.column, direction);
  while (!reached[`${candidate.row}-${candidate.column}`]) {
    if (where(candidate)) return candidate;
    reached[`${candidate.row}-${candidate.column}`] = true;
    candidate = cycleInAnswer(crossword, candidate.row, candidate.column, direction);
  }
  return null;
};

const findNext = (crossword, row, column, direction, clueAddresses, where) => {
  if (!notBlocked(crossword, row, column)) {
    return null;
  }

  let candidate = findInCycle(
    crossword, row, column, direction,
    box => where(box) && !isAt(box, row, column),
  );
  if (candidate) return candidate;

  const { label } = clueAddressAt(crossword, row, column, direction, clueAddresses);
  let currentIndex = (
    clueAddresses.findIndex(address => address.label === label) + 1
  ) % clueAddresses.length;
  let answerAddress = clueAddresses[currentIndex];
  while (answerAddress.label !== label) {
    candidate = findInCycle(
      crossword,
      answerAddress.row,
      answerAddress.column,
      direction,
      where,
    );
    if (candidate) {
      return candidate;
    }
    currentIndex = (currentIndex + 1) % clueAddresses.length;
    answerAddress = clueAddresses[currentIndex];
  }
  return null;
};

export const test = {
  firstBoxAddress,
  notBlocked,
  isAt,
  boxAt,
  candidateAt,
  cycleInAnswerDown,
  cycleInAnswerAcross,
  cycleInAnswer,
  findInCycle,
  findNext,
  calculateClueAddresses,
};

const findNextBlank = (crossword, row, column, direction, clueAddresses) => findNext(
  crossword, row, column, direction, clueAddresses,
  candidate => !get(candidate.box, 'content'),
);

const calculateCursorAfterAdvancement = (
  crossword,
  { row, column, direction },
  { [direction]: addresses }
) =>
  // candidateAt(crossword, row, column) ||
  findNextBlank(crossword, row, column, direction, addresses) ||
  { row, column };

export const calculateDerivedData = (crossword, cursor) => {
  const cursorContent = get(crossword, ['boxes', cursor.row, cursor.column, 'content']);
  const isCursorAnswer = calculateIsCursorAnswer(crossword, cursor);
  const isCursorBox = (row, column) => row === cursor.row && column === cursor.column;
  const isBlockedBox = (row, column) => !!get(crossword, `boxes.${row}.${column}.blocked`);
  const size = crossword.rows;
  const clueAddresses = calculateClueAddresses(crossword);
  const labelMap = calculateLabelMap(clueAddresses);
  const cursorAfterAdvancement = calculateCursorAfterAdvancement(crossword, cursor, clueAddresses);
  const acrossPattern = calculateAcrossPattern(cursor, crossword);
  const downPattern = calculateDownPattern(cursor, crossword);
  const themeSuggestions = calculateThemeSuggestions(
    crossword.themeEntries,
    acrossPattern,
    downPattern
  );
  const currentAnswers = calculateCurrentAnswers(crossword);

  return {
    cursorContent,
    isCursorAnswer,
    isCursorBox,
    isBlockedBox,
    size,
    clueAddresses,
    labelMap,
    cursorAfterAdvancement,
    themeSuggestions,
    currentAnswers,
  };
};
