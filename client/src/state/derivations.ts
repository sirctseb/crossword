import {
  type ArrayCrossword,
  type LabeledAddressCatalog,
  type LabeledAddress,
  type Address,
  type Candidate,
  type Direction,
} from ".";
import { coerceMatrixToArray } from "../firebase/coerceMatrixToArray";
import { coerceToObject } from "../jotai-firebase/utils/coerceToObject";
import type { Box, Crossword, Cursor, Matrix } from "../firebase/types";

export const deriveClueAddresses = (
  crossword: ArrayCrossword
): LabeledAddressCatalog => {
  const labeledAddresses: { across: LabeledAddress[]; down: LabeledAddress[] } =
    {
      across: [],
      down: [],
    };
  let clueIndex = 1;
  for (let row = 0; row < crossword.rows; row += 1) {
    for (let column = 0; column < crossword.rows; column += 1) {
      const blocked = crossword.boxes[row][column].blocked;
      const leftBlocked =
        column === 0 || crossword.boxes[row][column - 1].blocked;
      const topBlocked = row === 0 || crossword.boxes[row - 1][column].blocked;
      const indexBox = !blocked && (leftBlocked || topBlocked);
      if (indexBox && leftBlocked) {
        labeledAddresses.across.push({ row, column, label: clueIndex });
      }
      if (indexBox && topBlocked) {
        labeledAddresses.down.push({ row, column, label: clueIndex });
      }
      if (indexBox) {
        clueIndex += 1;
      }
    }
  }
  return labeledAddresses;
};

export const deriveLabelMap = (
  catalog: LabeledAddressCatalog
): Record<number, Record<number, number>> => {
  const map: Record<number, Record<number, number>> = {};
  const directions = ["across", "down"] as const;
  directions.forEach((direction) => {
    catalog[direction].forEach((address) => {
      map[address.row] = map[address.row] || {};
      map[address.row][address.column] = address.label;
    });
  });
  return map;
};

const firstBoxAddress = (
  crossword: ArrayCrossword,
  row: number,
  column: number,
  direction: Direction
): Address => {
  const columnChange = direction === "across" ? -1 : 0;
  const rowChange = direction === "across" ? 0 : -1;

  let rowIter = row;
  let columnIter = column;

  while (
    rowIter + rowChange >= 0 &&
    columnIter + columnChange >= 0 &&
    !crossword.boxes[rowIter + rowChange][columnIter + columnChange].blocked
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
  crossword: ArrayCrossword,
  row: number,
  column: number,
  direction: Direction,
  clueAddresses: LabeledAddress[]
): LabeledAddress => {
  const firstAddress = firstBoxAddress(crossword, row, column, direction);
  const boxAtFirstAddress = clueAddresses.find(
    (address) =>
      address.row === firstAddress.row && address.column === firstAddress.column
  );

  if (!boxAtFirstAddress) {
    throw new Error(
      `No clue address found for ${firstAddress.row}, ${firstAddress.column}`
    );
  }
  return boxAtFirstAddress;
};
const notBlocked = (
  crossword: ArrayCrossword,
  row: number,
  column: number
): boolean => !crossword.boxes[row][column].blocked;
const isAt = (address: Address, row: number, column: number): boolean =>
  address.row === row && address.column === column;
const boxAt = (crossword: ArrayCrossword, row: number, column: number): Box =>
  crossword.boxes[row][column] || {};
const candidateAt = (
  crossword: ArrayCrossword,
  row: number,
  column: number
): Candidate => ({
  row,
  column,
  box: boxAt(crossword, row, column),
});
const cycleInAnswerDown = (
  crossword: ArrayCrossword,
  row: number,
  column: number
): Candidate => {
  if (row + 1 < crossword.rows && notBlocked(crossword, row + 1, column)) {
    return candidateAt(crossword, row + 1, column);
  }
  let rowIter = row;
  while (rowIter - 1 >= 0 && notBlocked(crossword, rowIter - 1, column)) {
    rowIter -= 1;
  }
  return candidateAt(crossword, rowIter, column);
};
const cycleInAnswerAcross = (
  crossword: ArrayCrossword,
  row: number,
  column: number
): Candidate => {
  if (column + 1 < crossword.rows && notBlocked(crossword, row, column + 1)) {
    return candidateAt(crossword, row, column + 1);
  }
  let columnIter = column;
  while (columnIter - 1 >= 0 && notBlocked(crossword, row, columnIter - 1)) {
    columnIter -= 1;
  }
  return candidateAt(crossword, row, columnIter);
};
type Cycler = (
  crossword: ArrayCrossword,
  row: number,
  column: number
) => Candidate;
interface Cyclers {
  across: Cycler;
  down: Cycler;
}
const cyclers: Cyclers = {
  across: cycleInAnswerAcross,
  down: cycleInAnswerDown,
};
const cycleInAnswer = (
  crossword: ArrayCrossword,
  row: number,
  column: number,
  direction: Direction
): Candidate => cyclers[direction](crossword, row, column);
const findInCycle = (
  crossword: ArrayCrossword,
  row: number,
  column: number,
  direction: Direction,
  where: (candidate: Candidate) => boolean
): Candidate | null => {
  let candidate: Candidate = candidateAt(crossword, row, column);
  if (where(candidate)) return candidate;

  const reached = { [`${row}-${column}`]: true };
  candidate = cycleInAnswer(
    crossword,
    candidate.row,
    candidate.column,
    direction
  );
  while (!reached[`${candidate.row}-${candidate.column}`]) {
    if (where(candidate)) return candidate;
    reached[`${candidate.row}-${candidate.column}`] = true;
    candidate = cycleInAnswer(
      crossword,
      candidate.row,
      candidate.column,
      direction
    );
  }
  return null;
};
export const findNext = (
  crossword: ArrayCrossword,
  row: number,
  column: number,
  direction: Direction,
  clueAddresses: LabeledAddress[],
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
    (box) => where(box) && !isAt(box, row, column)
  );
  if (candidate) return candidate;

  const { label } = clueAddressAt(
    crossword,
    row,
    column,
    direction,
    clueAddresses
  );
  let currentIndex =
    (clueAddresses.findIndex((address) => address.label === label) + 1) %
    clueAddresses.length;
  let answerAddress = clueAddresses[currentIndex];
  while (answerAddress.label !== label) {
    candidate = findInCycle(
      crossword,
      answerAddress.row,
      answerAddress.column,
      direction,
      where
    );
    if (candidate) {
      return candidate;
    }
    currentIndex = (currentIndex + 1) % clueAddresses.length;
    answerAddress = clueAddresses[currentIndex];
  }
  return null;
};

const coerceMatrixToObject = <T>(
  matrix: Matrix<T>
): Record<string, Record<string, T>> => {
  const outer = coerceToObject(matrix);
  return Object.keys(outer).reduce<Record<string, Record<string, T>>>(
    (acc, key) => {
      acc[key] = coerceToObject(outer[key]);
      return acc;
    },
    {}
  );
};

export const deriveArrayCrossword = (crossword: Crossword): ArrayCrossword => {
  return {
    ...crossword,
    boxes: coerceMatrixToArray(
      crossword.boxes ?? [],
      {},
      crossword.rows,
      crossword.rows
    ),
    clues: {
      across: coerceMatrixToObject(crossword.clues?.across ?? {}),
      down: coerceMatrixToObject(crossword.clues?.down ?? {}),
    },
    themeEntries: Object.keys(coerceToObject(crossword.themeEntries ?? {})),
  };
};

export const findNextBlank = (
  crossword: ArrayCrossword,
  row: number,
  column: number,
  direction: Direction,
  clueAddresses: LabeledAddress[]
): Candidate | null =>
  findNext(
    crossword,
    row,
    column,
    direction,
    clueAddresses,
    (candidate) => !candidate.box.content
  );

const MISSING_VALUE = { blocked: true };
const coordsToSignifier = (
  row: number,
  column: number,
  crossword: ArrayCrossword
): string => {
  const { content, blocked } = crossword.boxes[row][column] || MISSING_VALUE;
  return blocked ? "|" : content || ".";
};
const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const flatten = <T>(arr: T[][]) =>
  arr.reduce((acc, val) => acc.concat(val), []);
const lineToAnswers = (line: string[]) =>
  line
    .join("")
    .split("|")
    .filter((answer) => answer.length > 0)
    .filter((answer) => !answer.includes("."));
export const deriveAllAnswers = (crossword: ArrayCrossword) => {
  return flatten(
    range(crossword.rows).map((row) => [
      ...lineToAnswers(
        range(crossword.rows).map((column) =>
          coordsToSignifier(row, column, crossword)
        )
      ),
      // TODO this is not working correctly for columns
      ...lineToAnswers(
        range(crossword.rows).map((column) =>
          coordsToSignifier(column, row, crossword)
        )
      ),
    ])
  );
};

export const deriveLabeledAddressMap = (
  labeledAddressCatalog: LabeledAddressCatalog
): Record<number, Record<number, number>> => {
  const map: Record<number, Record<number, number>> = {};
  const directions = ["across", "down"] as const;
  directions.forEach((direction) => {
    labeledAddressCatalog[direction].forEach((address) => {
      map[address.row] = map[address.row] || {};
      map[address.row][address.column] = address.label;
    });
  });
  return map;
};

export type Entity<T> = T & {
  id: string;
};
export type CursorMap = Record<
  number,
  Record<number, Entity<Cursor>[] | undefined> | undefined
>;
export const reduceCursors = (cursors: Record<string, Cursor>): CursorMap => {
  const result: CursorMap = {};
  Object.entries(cursors).forEach(([id, cursor]) => {
    if (cursor.row !== undefined && cursor.column !== undefined) {
      const vector = (result[cursor.row] ||= {});
      // TODO this part with adding the id to the object data is probably something
      // we want to support in firebase-recoil
      vector[cursor.column] = [
        ...(vector[cursor.column] || []),
        { ...cursor, id },
      ];
    }
  });
  return result;
};

export const crosswordFull = (crossword: ArrayCrossword): boolean => {
  const range = [...Array(crossword.rows).keys()];
  return range.every((row) =>
    range.every((column) => {
      const { blocked, content } = crossword.boxes?.[row]?.[column];
      return blocked || content;
    })
  );
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
  deriveClueAddresses,
  deriveArrayCrossword,
  reduceCursors,
};
