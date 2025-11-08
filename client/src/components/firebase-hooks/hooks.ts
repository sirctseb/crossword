import { ref } from "firebase/database";
import { useObjectVal } from "react-firebase-hooks/database";

import { getFirebaseDatabase } from "../../firebase";
import type {
  CommunalCrossword,
  Crossword,
  Cursor,
  User,
} from "../../firebase/types";

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

export function useCommunalCrossword(withDefault: true): CommunalCrossword;
export function useCommunalCrossword(
  withDefault?: false
): CommunalCrossword | undefined;
export function useCommunalCrossword(
  withDefault = false
): CommunalCrossword | undefined {
  const value = useObjectVal<CommunalCrossword>(
    ref(database, `/communalCrossword`)
  )[0];

  if (withDefault) {
    return (
      value || {
        current: "",
        archive: {},
      }
    );
  }
}
