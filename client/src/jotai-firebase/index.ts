import {
  Database,
  DataSnapshot,
  ref,
  onValue,
  get,
  set,
  remove,
} from "firebase/database";
import { interpolatePathSpec, PathParameters } from "./interpolatePathSpec";
import { atomFamily, atomWithStorage } from "jotai/utils";
import type { AsyncStorage } from "jotai/vanilla/utils/atomWithStorage";
import deepEqual from "fast-deep-equal";

export type FirebaseValue = boolean | string | number | Object | null;
export type FirebaseReadValue = FirebaseValue | undefined;
export type { PathParameters };

function firebaseStorage<T extends FirebaseReadValue>(
  database: Database
): AsyncStorage<T> {
  return {
    getItem: async (key, initialValue) => {
      // this is a very specific case, but only onValue works with this special path.
      // get throws an exception
      if (key !== ".info/connected") {
        return await get(ref(database, key)).then((snapshot) => snapshot.val());
      }
      // TODO this is a shallow concept of an initial value if we simply return it here.
      // we should have to set the location in fb to it
      // how would we determine whether we _should_ set it on get? if the get value doesn't exist?
      return initialValue;
    },
    setItem: async (key, value) => {
      await set(ref(database, key), value);
    },
    removeItem: async (key) => {
      await remove(ref(database, key));
    },
    subscribe(key, callback, initialValue) {
      const handler = (snapshot: DataSnapshot) => {
        callback(snapshot.val());
      };
      // the value returned by onValue is the function to call to unsubscribe the handler.
      // this is what we need to call to perform the effect cleanup, so we can return
      // it directly here
      return onValue(ref(database, key), handler);
    },
  };
}

// logical conclusion is, i guess, generation of atom factories for paths from bolt, with typed path parameters
// very much like graphql-tools

// TODO propose signature change to atomWithStorage to make defaultValue optional when
// options.getOnInit is true
// the other place you have to account for it is on RESET

export function makeAtom<T extends FirebaseReadValue>(
  path: string,
  database: Database,
  initialValue: T
) {
  return atomWithStorage<T>(
    path,
    // TODO i don't think it actually makes sense to have a default value here, but this is typed to require it
    initialValue,
    firebaseStorage<T>(database),
    // OH! I think this is the key (remember to look at the source here). it seems to force a get
    // before it returns with the first value (somehow)
    { getOnInit: true }
  );
}

export function makeAtomFamily<
  T extends FirebaseReadValue,
  P extends PathParameters
>(pathSpec: string, database: Database, initialValue: T) {
  return atomFamily(
    (params: P) =>
      atomWithStorage<T>(
        interpolatePathSpec(pathSpec, params),
        initialValue,
        firebaseStorage<T>(database)
      ),
    deepEqual
  );
}
