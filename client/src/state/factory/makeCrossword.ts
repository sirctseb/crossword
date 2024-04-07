import { type ArrayCrossword } from "..";

const boxesFromShorthand = (shorthand: string[]): ArrayCrossword["boxes"] => {
  return shorthand.map((row) =>
    row.split("").map((entry) => ({ blocked: entry === "b", content: entry }))
  );
};

export function makeCrossword(
  crossword: Partial<ArrayCrossword>,
  shorthand?: string[]
): ArrayCrossword;
export function makeCrossword(shorthand: string[]): ArrayCrossword;
export function makeCrossword(
  crosswordOrShorthand: Partial<ArrayCrossword> | string[],
  shorthandOrNothing?: string[]
): ArrayCrossword {
  if (!Array.isArray(crosswordOrShorthand)) {
    const crossword = crosswordOrShorthand;
    const shorthand = shorthandOrNothing;

    return {
      symmetric: false,
      rows: 0,
      boxes: shorthand ? boxesFromShorthand(shorthand) : [],
      clues: {
        across: {},
        down: {},
      },
      themeEntries: [],
      ...crossword,
    };
  }

  const shorthand = crosswordOrShorthand;
  return {
    symmetric: false,
    rows: shorthand.length,
    boxes: boxesFromShorthand(shorthand),
    clues: {
      across: {},
      down: {},
    },
    themeEntries: [],
  };
}
