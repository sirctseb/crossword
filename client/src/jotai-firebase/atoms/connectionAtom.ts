import type { Database } from "firebase/database";
import { makeAtom } from "..";

export const makeConnectionAtom = (database: Database) =>
  makeAtom<boolean>(".info/connected", database, false);
