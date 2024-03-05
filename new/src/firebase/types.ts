export type FirebaseArray<K extends string, T> = Record<K, T> | T[];
export type Matrix<Type> = FirebaseArray<Index, FirebaseArray<Index, Type>>;
export type Presence<Type extends string> = FirebaseArray<Type, boolean>;
export type Clues = {
  across?: Matrix<string>;
  down?: Matrix<string>;
};
export type Crossword = {
  rows: number;
  symmetric: boolean;
  themeEntries?: FirebaseArray<string, boolean>;
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
  crosswords?: FirebaseArray<string, CrosswordMetadata>;
  wordlist?: FirebaseArray<string, WordlistEntry>;
};
export type Permissions = {
  owner: UserId;
  collaborators?: Presence<UserId>;
  global?: boolean;
};
export type UserId = string;
export type CrosswordId = string;
