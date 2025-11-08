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

export const useRemoteCursors = (
  crosswordId: string,
  cursorId: string | null
): Record<string, Cursor> | undefined => {
  // no need for a skeleton data views because empty cursors is just an empty object
  // weird not to be consistent thought
  const { ...cursors } = useCursors(crosswordId) ?? {};

  // inline selector definition. we don't have a pattern anymore for this
  // without recoil
  if (cursorId) {
    delete cursors[cursorId];
  }

  return cursors;
};

interface Skeletonized<T> {
  // if we want to allow for partial data. burden on the client code though
  // [K in keyof T]: Partial<T[K]>;
  // [K in keyof T]: T[K];
  data?: T;
  skeleton: T;
}

export function useCommunalCrossword(): Skeletonized<CommunalCrossword> {
  const data = useObjectVal<CommunalCrossword>(
    ref(database, `/communalCrossword`)
  )[0];

  return {
    data,
    skeleton: data ?? { current: "", archive: {} },
  };
}
