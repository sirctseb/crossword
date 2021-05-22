import { makeAtomFamily, PathParameters } from './static';

export enum Direction {
  across = 'across',
  down = 'down',
}

export type Matrix<P> = ((P | undefined)[] | undefined)[];

export interface Box {
  blocked?: boolean;
  circled?: boolean;
  shaded?: boolean;
  content?: string;
}

export interface Crossword {
  rows: number;
  symmetric: boolean;
  // TODO any object or array-valued field in bolt is implicitly nullable -> optional
  // need to study and confirm
  themeEntries?: Record<string, boolean>;
  clues?: Record<Direction, Matrix<string>>;
  // TODO we don't actually know if this is a Box[][] or a Record<Record<number, Box>>
  // and we are suffering from it because they are often interchangeable in client code but not by type
  // maybe this is something we normalize
  boxes?: Matrix<Box>;
  title?: string;
}

interface CrosswordsParams extends PathParameters {
  crosswordId: string;
}

export const Crosswords = makeAtomFamily<Crossword, CrosswordsParams>('/crosswords/{crosswordId}');
