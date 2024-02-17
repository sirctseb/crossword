import { atom, AtomEffect, atomFamily, RecoilState } from "recoil";
import { Database, DataSnapshot, ref, onValue, get } from "firebase/database";
import { interpolatePathSpec, PathParameters } from "./interpolatePathSpec";

export type FirebaseValue = boolean | string | number | Object;
export type { PathParameters };

function fbValueSubscriptionEffect<T extends FirebaseValue>(
  path: string,
  database: Database
): AtomEffect<T> {
  return ({ setSelf }) => {
    const handler = (snapshot: DataSnapshot) => {
      setSelf(snapshot.val());
    };
    // the value returned by onValue is the function to call to unsubscribe the handler.
    // this is what we need to call to perform the effect cleanup, so we can return
    // it directly here
    return onValue(ref(database, path), handler);
  };
}

// logical conclusion is, i guess, generation of atom factories for paths from bolt, with typed path parameters
// very much like graphql-tools

export function makeAtom<T extends FirebaseValue>(
  path: string,
  database: Database
): RecoilState<T> {
  return atom<T>({
    key: `firebase-recoil:${path}`,
    effects: [fbValueSubscriptionEffect<T>(path, database)],
    // TODO find out whether this or initializing in effect is better
    default: get(ref(database, path)).then((snapshot) => snapshot.val()),
  });
}

export function makeAtomFamily<
  T extends FirebaseValue,
  P extends PathParameters
>(pathSpec: string, database: Database): (param: P) => RecoilState<T> {
  // TODO if we have some unique id for the app, we can include in the key
  // and support multiple firebase connections
  return atomFamily<T, P>({
    key: `firebase-recoil:${pathSpec}`,
    effects: (params) => [
      // TODO what would happen if we threw an exception here?
      fbValueSubscriptionEffect<T>(
        interpolatePathSpec(pathSpec, params),
        database
      ),
    ],
    // TODO find out whether this or initializing in effect is better
    default: async (params) => {
      return await get(
        ref(database, interpolatePathSpec(pathSpec, params))
      ).then((snapshot) => snapshot.val());
    },
  });
}

// can we get these things to work off a pre-poulated cache for ssr?
// maybe default or effect can read from a global cache

export function coerceToObject<T>(
  value: Record<string, T> | T[]
): Record<string, T> {
  if (Array.isArray(value)) {
    const result: Record<string, T> = {};
    value.forEach((entry, index) => {
      if (entry) {
        result[index] = entry;
      }
    });
    return result;
  }
  return value;
}
