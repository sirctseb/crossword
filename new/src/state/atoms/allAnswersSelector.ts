import { selectorFamily } from "recoil";
import { arrayCrosswordSelector, type ArrayCrossword } from "..";

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

export const allAnswersSelector = selectorFamily<
  string[],
  { crosswordId: string }
>({
  key: "allAnswersSelector",
  get:
    (params) =>
    ({ get }) => {
      const crossword = get(arrayCrosswordSelector(params));

      return flatten(
        range(crossword.rows).map((row) => [
          ...lineToAnswers(
            range(crossword.rows).map((column) =>
              coordsToSignifier(row, column, crossword)
            )
          ),
          ...lineToAnswers(
            range(crossword.rows).map((column) =>
              coordsToSignifier(column, row, crossword)
            )
          ),
        ])
      );
    },
});
