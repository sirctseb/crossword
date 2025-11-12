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
  deriveLabeledAddressMap,
} from "../../state/derivations";
import { useAtomValue } from "jotai";
import { remoteCursorAtomFamily } from "../../state/atoms/firebaseAtoms";

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

const skeletonLabeledAddressMap: Record<number, Record<number, number>> = {};
export const useLabeledAddressMap = (
  crosswordId: string
): Skeletonized<Record<number, Record<number, number>>> => {
  const labeledAddressCatalog = useLabeledAddressCatalog(crosswordId).data;

  return useMemo(() => {
    const data =
      labeledAddressCatalog && deriveLabeledAddressMap(labeledAddressCatalog);
    return {
      data,
      skeleton: skeletonLabeledAddressMap,
      fallback: data || skeletonLabeledAddressMap,
    };
  }, [labeledAddressCatalog]);
};

export const useRemoteCursors = (
  crosswordId: string,
  cursorId: string | null
): Record<string, Cursor> => {
  return useAtomValue(remoteCursorAtomFamily({ crosswordId, cursorId })) || {};
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

export const useConnection = (): boolean => {
  // TODO we have this type wrong
  return !!useObjectVal<CommunalCrossword>(ref(database, `.info/connected`))[0];
};
