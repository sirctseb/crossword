import { ref } from "firebase/database";
import { useObjectVal } from "react-firebase-hooks/database";

import { getFirebaseDatabase } from "../../firebase";
import type {
  CommunalCrossword,
  Crossword,
  Cursor,
  User,
} from "../../firebase/types";
import type { ArrayCrossword, LabeledAddressCatalog } from "../../state";
import { useMemo } from "react";
import {
  deriveAllAnswers,
  deriveArrayCrossword,
  deriveClueAddresses,
} from "../../state/derivations";

const database = getFirebaseDatabase();

interface Skeletonized<T> {
  // if we want to allow for partial data. burden on the client code though
  // [K in keyof T]: Partial<T[K]>;
  // [K in keyof T]: T[K];
  data?: T;
  skeleton: T;
  // data, if it is set. skeleton otherwise
  fallback: T;
}

export const useCrossword = (crosswordId: string): Crossword | undefined => {
  // TODO atoms covered up the loading states somehow
  return useObjectVal<Crossword>(
    ref(database, `/crosswords/${crosswordId}`)
  )[0];
};

const skeletonArrayCrossword: ArrayCrossword = {
  rows: 5,
  clues: { across: {}, down: {} },
  symmetric: true,
  themeEntries: [],
  boxes: Array.from({ length: 5 }, () =>
    Array.from({ length: 5 }, () => ({ blocked: false, content: "" }))
  ),
  title: "Loading...",
};

export const useArrayCrossword = (
  crosswordId: string
): Skeletonized<ArrayCrossword> => {
  const crossword = useCrossword(crosswordId);
  return useMemo(() => {
    const data = crossword && deriveArrayCrossword(crossword);
    const skeleton = skeletonArrayCrossword;
    return {
      data,
      skeleton,
      fallback: data || skeleton,
    };
  }, [crossword]);
};

export const useAllAnswers = (crosswordId: string): string[] => {
  // TODO weird to assume we can just operated on the fallback here
  // its not communicated in the hook. probably should make all of these
  // skeletonized until we figure out a magic solution
  const arrayCrossword = useArrayCrossword(crosswordId).fallback;
  return useMemo(() => {
    return deriveAllAnswers(arrayCrossword);
  }, [arrayCrossword]);
};

const skeletonLabeledAddressCatalog: LabeledAddressCatalog = {
  across: [],
  down: [],
};
export const useLabeledAddressCatalog = (
  crosswordId: string
): Skeletonized<LabeledAddressCatalog> => {
  const crossword = useArrayCrossword(crosswordId).fallback;
  return useMemo(() => {
    const data = crossword && deriveClueAddresses(crossword);
    const skeleton = skeletonLabeledAddressCatalog;
    return {
      data,
      skeleton,
      fallback: data || skeleton,
    };
  }, [crossword]);

  // we lose the derivation memo if we don't add that to the skeleton hook
  // return useSkeletonData(
  //   crossword && deriveClueAddresses(crossword),
  //   skeletonLabeledAddressCatalog
  // );
};

function useSkeletonData<T>(data: T | undefined, skeleton: T): Skeletonized<T> {
  return useMemo(
    () => ({
      data,
      skeleton,
      fallback: data || skeleton,
    }),
    [data, skeleton]
  );
}

export const useUserCrosswords = (
  userId: string
): Skeletonized<User["crosswords"]> => {
  return useSkeletonData<User["crosswords"]>(
    useObjectVal<User["crosswords"]>(
      ref(database, `/users/${userId}/crosswords`)
    )[0],
    []
  );
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

const communalCrosswordSkeleton: CommunalCrossword = {
  current: "",
  archive: {},
};
export function useCommunalCrossword(): Skeletonized<CommunalCrossword> {
  const data = useObjectVal<CommunalCrossword>(
    ref(database, `/communalCrossword`)
  )[0];

  const skeleton = communalCrosswordSkeleton;

  return {
    data,
    skeleton,
    fallback: data || skeleton,
  };
}
