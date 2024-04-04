import { makeAuthAtom } from "./auth";
import { getFirebaseApp, getFirebaseDatabase } from "../firebase";
import { makeAtom, makeAtomFamily } from ".";
import type { Crossword, Cursor, User } from "../firebase/types";

const database = getFirebaseDatabase();

export const authAtom = makeAuthAtom(getFirebaseApp());

export const connectionAtom = makeAtom<boolean>(
  ".info/connected",
  database,
  false
);

export const crosswordAtomFamily = makeAtomFamily<
  Crossword,
  { crosswordId: string }
>("/crosswords/{crosswordId}", database);

export const userCrosswordAtom = makeAtomFamily<
  User["crosswords"],
  { userId: string }
>("/users/{userId}/crosswords", database);

export const wordListAtomFamily = makeAtomFamily<
  User["wordlist"],
  { userId: string }
>("/users/{userId}/wordlist", database);

export const cursorsAtomFamily = makeAtomFamily<
  Record<string, Cursor>,
  { crosswordId: string }
>("/cursors/{crosswordId}", database);
