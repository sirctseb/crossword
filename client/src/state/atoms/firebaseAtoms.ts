import { getDatabase } from "firebase/database";
import type { CommunalCrossword, User } from "../../firebase/types";
import { makeAtom, makeAtomFamily } from "../../jotai-firebase";

const database = getDatabase();

export const communalCrosswordAtom = makeAtom<CommunalCrossword>(
  "/communalCrossword",
  database,
  // you can't skeleton data this, there is string value that is a key
  { current: "", archive: {} }
);

export const wordListAtomFamily = makeAtomFamily<
  User["wordlist"],
  { userId: string }
>("/users/{userId}/wordlist", getDatabase(), []);
