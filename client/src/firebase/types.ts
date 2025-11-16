import type { FirebaseArray, FirebaseList } from "../jotai-firebase/types";

export type Matrix<Type> = FirebaseArray<FirebaseArray<Type>>;
export type Presence<Type extends string> = FirebaseArray<boolean, Type>;

export type CurrentUser = UserId;

export type Clues = {
  across?: Matrix<string>;
  down?: Matrix<string>;
};
export type Crossword = {
  rows: number;
  symmetric: boolean;
  themeEntries?: Presence<string>;
  clues?: Clues;
  boxes?: Matrix<Box>;
  title?: string;
};
export type Index = string;
export type Direction = string;
export type Box = {
  blocked?: boolean;
  circled?: boolean;
  shaded?: boolean;
  content?: string;
};
export type CrosswordMetadata = {
  title?: string;
};
export type WordlistEntry = {
  word: string;
  usedBy?: Presence<CrosswordId>;
};
export type User = {
  crosswords?: FirebaseList<CrosswordMetadata>;
  wordlist?: FirebaseList<WordlistEntry>;
};
export type Permissions = {
  owner: UserId;
  collaborators?: Presence<UserId>;
  global?: boolean;
  readonly?: boolean;
};
export type UserId = string;
export type CrosswordId = string;
export type Cursor = {
  userId: CurrentUser;
  row?: number;
  column?: number;
  displayName?: string;
  photoURL?: string;
  color?: string;
};
export type CommunalCrossword = {
  current: CrosswordId;
  archive?: FirebaseList<CrosswordId>;
};
