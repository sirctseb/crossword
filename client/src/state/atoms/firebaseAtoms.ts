import type {
  FirebaseArray,
  CommunalCrossword,
  Crossword,
  Cursor,
  WordlistEntry,
} from "../../firebase/types";
import { makeAtom, makeAtomFamily } from "../../jotai-firebase";
import { getFirebaseDatabase } from "../../firebase";
import { makeConnectionAtom } from "../../jotai-firebase/atoms/connectionAtom";

const database = getFirebaseDatabase();

export const communalCrosswordAtom = makeAtom<CommunalCrossword>(
  "/communalCrossword",
  database,
  // you can't skeleton data this, there is string value that is a key
  { current: "", archive: {} }
);

export const wordListAtomFamily = makeAtomFamily<
  FirebaseArray<string, WordlistEntry>
>(
  database,
  {}
)("/users/{userId}/wordlist");

export const userCrosswordsAtomFamily = makeAtomFamily<
  FirebaseArray<string, Crossword>
>(
  database,
  {}
)("/users/{userId}/crosswords");

type Cursors = FirebaseArray<string, Cursor>;
export const cursorsAtomFamily = makeAtomFamily<Cursors | null>(
  database,
  {}
)("/cursors/{crosswordId}");

export const connectionAtom = makeConnectionAtom(database);
