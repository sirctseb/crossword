import type { CommunalCrossword, Cursor, User } from "../../firebase/types";
import { makeAtom, makeAtomFamily } from "../../jotai-firebase";
import { getFirebaseDatabase } from "../../firebase";
import { makeConnectionAtom } from "../../jotai-firebase/atoms/connectionAtom";
import type {
  FirebaseList,
  FirebaseReadValue,
} from "../../jotai-firebase/types";

const database = getFirebaseDatabase();

export const communalCrosswordAtom = makeAtom<CommunalCrossword>(
  "/communalCrossword",
  database,
  // you can't skeleton data this, there is string value that is a key
  { current: "", archive: {} }
);

export const wordListAtomFamily = makeAtomFamily<User["wordlist"]>(
  database,
  {}
)("/users/{userId}/wordlist");

export const userCrosswordsAtomFamily = makeAtomFamily<User["crosswords"]>(
  database,
  {}
)("/users/{userId}/crosswords");

type Cursors = FirebaseReadValue<FirebaseList<Cursor>>;
export const cursorsAtomFamily = makeAtomFamily<Cursors>(
  database,
  {}
)("/cursors/{crosswordId}");

export const connectionAtom = makeConnectionAtom(database);
