import { Direction, Crossword, Box } from '../../firebase-recoil/data';

const range = (count: number) => [...Array(count).keys()];
const flatten = (arrays: any[][]): any[] => {
  return arrays.reduce((total, current) => [...total, ...current], []);
};

interface Coordinate {
  row: number;
  column: number;
}

interface Address extends Coordinate {
  label: number;
}

interface Cursor extends Coordinate {
  direction: Direction;
}

const calculateAcrossPattern = ({ row, column }: Coordinate, crossword: Crossword): string => {
  const across = [];
  for (let i = column; i >= 0 && !crossword.boxes?.[row]?.[i].blocked; i -= 1) {
    across.push(crossword.boxes?.[row]?.[i]?.content || '.');
  }
  across.reverse();
  for (let i = column + 1; i < crossword.rows && !crossword?.boxes?.[row]?.[i]?.blocked; i += 1) {
    across.push(crossword.boxes?.[row]?.[i]?.content || '.');
  }
  return `^${across.join('')}$`;
};

const calculateDownPattern = ({ row, column }: Coordinate, crossword: Crossword): string => {
  const down = [];
  for (let i = row; i >= 0 && !crossword.boxes?.[i]?.[column].blocked; i -= 1) {
    down.push(crossword.boxes?.[i]?.[column]?.content || '.');
  }
  down.reverse();
  for (let i = row + 1; i < crossword.rows && !crossword.boxes?.[i]?.[column].blocked; i += 1) {
    down.push(crossword.boxes?.[i]?.[column]?.content || '.');
  }
  return `^${down.join('')}$`;
};

interface ThemeSuggestions {
  across: string[];
  down: string[];
}

const calculateThemeSuggestions = (
  themeEntries: string[],
  acrossPattern: string,
  downPattern: string
): ThemeSuggestions => ({
  across: [...themeEntries.filter((entry) => entry.match(acrossPattern))],
  down: [...themeEntries.filter((entry) => entry.match(downPattern))],
});

const calculateCurrentAnswers = (crossword: Crossword): string[] => {
  const MISSING_VALUE = { blocked: true };
  const coordsToSignifier = (row: number, column: number): string => {
    const { content, blocked } = crossword.boxes?.[row]?.[column] || MISSING_VALUE;
    return blocked ? '|' : content || '.';
  };
  const lineToAnswers = (line: string[]) =>
    line
      .join('')
      .split('|')
      .filter((answer) => answer.length > 0)
      .filter((answer) => !answer.includes('.'));
  return flatten(
    range(crossword.rows).map((row) => [
      ...lineToAnswers(range(crossword.rows).map((column) => coordsToSignifier(row, column))),
      ...lineToAnswers(range(crossword.rows).map((column) => coordsToSignifier(column, row))),
    ])
  );
};

const calculateIsCursorAnswer = (crossword: Crossword, cursor: Cursor) => (row: number, column: number): boolean => {
  const box = crossword.boxes?.[row]?.[column] || {};
  if (box.blocked) return false;
  if (row === cursor.row && column === cursor.column) return true;

  if (cursor.direction === Direction.across) {
    if (row !== cursor.row) {
      return false;
    }

    for (
      let increment = Math.sign(cursor.column - column), columnIter = column;
      columnIter >= 0 && columnIter < crossword.rows && !crossword.boxes?.[row]?.[columnIter]?.blocked;
      columnIter += increment
    ) {
      if (columnIter === cursor.column) {
        return true;
      }
    }
    return false;
  }

  if (column !== cursor.column) {
    return false;
  }

  for (
    let increment = Math.sign(cursor.row - row), rowIter = row;
    rowIter >= 0 && rowIter < crossword.rows && !crossword?.boxes?.[rowIter]?.[column]?.blocked;
    rowIter += increment
  ) {
    if (rowIter === cursor.row) {
      return true;
    }
  }
  return false;
};

type CrosswordAddresses = Record<Direction, Address[]>;
/**
 * Returns a map from directions to a list of boxes with their rows, columns, and labels
 */
const calculateClueAddresses = (crossword: Crossword): CrosswordAddresses => {
  const addresses: CrosswordAddresses = {
    across: [],
    down: [],
  };
  let clueIndex = 1;
  for (let row = 0; row < crossword.rows; row += 1) {
    for (let column = 0; column < crossword.rows; column += 1) {
      const blocked = crossword.boxes?.[row]?.[column]?.blocked;
      const leftBlocked = column === 0 || crossword.boxes?.[row]?.[column - 1]?.blocked;
      const topBlocked = row === 0 || crossword.boxes?.[row - 1]?.[column]?.blocked;
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
const calculateLabelMap = (addresses: CrosswordAddresses): Record<number, Record<number, number>> => {
  const map: Record<number, Record<number, number>> = {};
  [Direction.across, Direction.down].forEach((direction) => {
    addresses[direction].forEach((address) => {
      map[address.row] = map[address.row] || {};
      map[address.row][address.column] = address.label;
    });
  });
  return map;
};

// All the of rest are in service of calculateCursorAfterAdvancement

const firstBoxAddress = (crossword: Crossword, row: number, column: number, direction: Direction) => {
  const columnChange = direction === Direction.across ? -1 : 0;
  const rowChange = direction === Direction.across ? 0 : -1;

  let rowIter = row;
  let columnIter = column;
  while (
    rowIter + rowChange >= 0 &&
    columnIter + columnChange >= 0 &&
    !crossword.boxes?.[rowIter + rowChange]?.[columnIter + columnChange]?.blocked
  ) {
    columnIter += columnChange;
    rowIter += rowChange;
  }
  return { row: rowIter, column: columnIter };
};

/**
 * The address of the labeled box of the answer that contains the given row/column
 */
const clueAddressAt = (
  crossword: Crossword,
  row: number,
  column: number,
  direction: Direction,
  clueAddresses: Address[]
): Address => {
  const firstAddress = firstBoxAddress(crossword, row, column, direction);
  return clueAddresses.find(
    (address) => address.row === firstAddress.row && address.column === firstAddress.column
  ) as Address; // We promise this is always found and don't want to burden the caller with undefined
};

const notBlocked = (crossword: Crossword, row: number, column: number): boolean =>
  !crossword.boxes?.[row]?.[column]?.blocked;
const isAt = (address: Coordinate, row: number, column: number): boolean =>
  address.row === row && address.column === column;
const boxAt = (crossword: Crossword, row: number, column: number): Box => crossword.boxes?.[row]?.[column] || {};

// exported for test
export interface Candidate extends Coordinate {
  box: Box;
}
const candidateAt = (crossword: Crossword, row: number, column: number): Candidate => ({
  row,
  column,
  box: boxAt(crossword, row, column),
});

const cycleInAnswerDown = (crossword: Crossword, row: number, column: number): Candidate => {
  if (row + 1 < crossword.rows && notBlocked(crossword, row + 1, column)) {
    return candidateAt(crossword, row + 1, column);
  }
  let rowIter = row;
  while (rowIter - 1 >= 0 && notBlocked(crossword, rowIter - 1, column)) {
    rowIter -= 1;
  }
  return candidateAt(crossword, rowIter, column);
};

const cycleInAnswerAcross = (crossword: Crossword, row: number, column: number): Candidate => {
  if (column + 1 < crossword.rows && notBlocked(crossword, row, column + 1)) {
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

const cycleInAnswer = (crossword: Crossword, row: number, column: number, direction: Direction): Candidate =>
  cyclers[direction](crossword, row, column);

const findInCycle = (
  crossword: Crossword,
  row: number,
  column: number,
  direction: Direction,
  where: (candidate: Candidate) => boolean
): Candidate | null => {
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

const findNext = (
  crossword: Crossword,
  row: number,
  column: number,
  direction: Direction,
  clueAddresses: Address[],
  where: (candidate: Candidate) => boolean
): Candidate | null => {
  if (!notBlocked(crossword, row, column)) {
    return null;
  }

  let candidate = findInCycle(
    crossword,
    row,
    column,
    direction,
    (candidate) => where(candidate) && !isAt(candidate, row, column)
  );
  if (candidate) return candidate;

  const { label } = clueAddressAt(crossword, row, column, direction, clueAddresses);
  let currentIndex = (clueAddresses.findIndex((address) => address.label === label) + 1) % clueAddresses.length;
  let answerAddress = clueAddresses[currentIndex];
  while (answerAddress.label !== label) {
    candidate = findInCycle(crossword, answerAddress.row, answerAddress.column, direction, where);
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

const findNextBlank = (
  crossword: Crossword,
  row: number,
  column: number,
  direction: Direction,
  clueAddresses: Address[]
) => findNext(crossword, row, column, direction, clueAddresses, (candidate) => !candidate.box.content);

const calculateCursorAfterAdvancement = (
  crossword: Crossword,
  { row, column, direction }: Cursor,
  { [direction]: addresses }: CrosswordAddresses
) =>
  // candidateAt(crossword, row, column) ||
  findNextBlank(crossword, row, column, direction, addresses) || { row, column };

export default (crossword: Crossword, cursor: Cursor) => {
  const cursorContent = crossword.boxes?.[cursor.row]?.[cursor.column]?.content;
  const isCursorAnswer = calculateIsCursorAnswer(crossword, cursor);
  const isCursorBox = (row: number, column: number) => row === cursor.row && column === cursor.column;
  const isBlockedBox = (row: number, column: number) => !!crossword.boxes?.[row]?.[column]?.blocked;
  const size = crossword.rows;
  const clueAddresses = calculateClueAddresses(crossword);
  const labelMap = calculateLabelMap(clueAddresses);
  const cursorAfterAdvancement = calculateCursorAfterAdvancement(crossword, cursor, clueAddresses);
  const acrossPattern = calculateAcrossPattern(cursor, crossword);
  const downPattern = calculateDownPattern(cursor, crossword);
  const themeSuggestions = calculateThemeSuggestions(
    Object.keys(crossword.themeEntries || {}),
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
    acrossPattern,
    downPattern,
  };
};
