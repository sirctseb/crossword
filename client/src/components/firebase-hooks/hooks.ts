import { useObjectVal } from "react-firebase-hooks/database";

import { getFirebaseDatabase } from "../../firebase";
import type {
  CommunalCrossword,
  Crossword,
  Cursor,
  User,
} from "../../firebase/types";
import { ref } from "firebase/database";

const database = getFirebaseDatabase();

export const useCrossword = (crosswordId: string): Crossword | undefined => {
  // TODO atoms covered up the loading states somehow
  return useObjectVal<Crossword>(
    ref(database, `/crosswords/${crosswordId}`)
  )[0];
};

export const useUserCrossword = (userId: string): User["crosswords"] => {
  return useObjectVal<User["crosswords"]>(
    ref(database, `/users/${userId}/crosswords`)
  )[0];
};

export const useWordList = (userId: string): User["wordlist"] => {
  return useObjectVal<User["wordlist"]>(
    ref(database, `/users/${userId}/wordlist`)
  )[0];
};

export const useCursors = (
  crosswordId: string
): Record<string, Cursor> | undefined => {
  return useObjectVal<Record<string, Cursor>>(
    ref(database, `/cursors/${crosswordId}`)
  )[0];
};

export const useCommunalCrossword = (): CommunalCrossword | undefined => {
  return useObjectVal<CommunalCrossword>(
    ref(database, `/communalCrossword`)
  )[0];
};
