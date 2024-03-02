import { selectorFamily } from "recoil";
import {
  Address,
  Candidate,
  ArrayCrossword,
  type LabeledBox,
  type Direction,
} from "./types";
import { arrayCrosswordFamily, clueAddressesSelector, cursorAtom } from ".";
import type { Box } from "../firebase/types";

const firstBoxAddress = (
  crossword: ArrayCrossword,
  row: number,
  column: number,
  direction: Direction
): Address => {
  const columnChange = direction === "across" ? -1 : 0;
  const rowChange = direction === "down" ? 0 : -1;

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
  // TODO fix and align these variable names and types
  clueAddresses: LabeledBox[]
): LabeledBox => {
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

const findNext = (
  crossword: ArrayCrossword,
  row: number,
  column: number,
  direction: Direction,
  clueAddresses: LabeledBox[],
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
  // make a pure function layer for this
  // getClueAddresses,
};

const findNextBlank = (
  crossword: ArrayCrossword,
  row: number,
  column: number,
  direction: Direction,
  clueAddresses: LabeledBox[]
): Candidate | null =>
  findNext(
    crossword,
    row,
    column,
    direction,
    clueAddresses,
    (candidate) => !candidate.box.content
  );

export const cursorAfterAdvancementSelector = selectorFamily<
  Address,
  {
    crosswordId: string;
  }
>({
  key: "cursor-after-advancement",
  get:
    (params) =>
    ({ get }) => {
      const crossword = get(arrayCrosswordFamily(params));
      const { row, column, direction } = get(cursorAtom);
      const clueAddresses = get(clueAddressesSelector(params));
      return (
        findNextBlank(
          crossword,
          row,
          column,
          direction,
          clueAddresses[direction]
        ) || { row, column }
      );
    },
});
