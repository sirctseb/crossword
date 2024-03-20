import { atom, AtomEffect, atomFamily, RecoilState } from "recoil";
import { Database, DataSnapshot, ref, onValue, get } from "firebase/database";
import { interpolatePathSpec, PathParameters } from "./interpolatePathSpec";
import type { FirebaseArray } from "../firebase/types";

export type FirebaseValue = boolean | string | number | Object | null;
export type FirebaseReadValue = FirebaseValue | undefined;
export type { PathParameters };

function fbValueSubscriptionEffect<T extends FirebaseReadValue>(
  path: string,
  database: Database
): AtomEffect<T> {
  return ({ setSelf }) => {
    setSelf(get(ref(database, path)).then((snapshot) => snapshot.val()));

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

export function makeAtom<T extends FirebaseReadValue>(
  path: string,
  database: Database
): RecoilState<T> {
  return atom<T>({
    key: `firebase-recoil:${path}`,
    effects: [fbValueSubscriptionEffect<T>(path, database)],
    // TODO this is an alternative to calling setSelf synchronously in the effect
    // should figure out what, if any, the behavior differences are
    // default: get(ref(database, path)).then((snapshot) => snapshot.val()),
  });
}

export function makeAtomFamily<
  T extends FirebaseReadValue,
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
    // TODO this is an alternative to calling setSelf synchronously in the effect
    // should figure out what, if any, the behavior differences are
    // default: async (params) => {
    //   // TODO figure out how to handle this in SSR
    //   if (typeof window !== "undefined") {
    //     return await get(
    //       ref(database, interpolatePathSpec(pathSpec, params))
    //     ).then((snapshot) => snapshot.val());
    //   }
    //   return {};
    // },
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

function fillBlanksWithValue<T>(
  value: T[],
  defaultValue: T,
  length: number
): T[] {
  const result = [...value];
  for (let i = 0; i < length; i++) {
    if (result[i] === undefined) {
      result[i] = defaultValue;
    }
  }
  return result;
}

/**
 * Take an arbitrary FirebaseArray value and return an array form in case
 * it is an object with number keys instead of a native array.
 *
 * If a defaultValue and length are provided, any absent values in the resulting
 * array (array access returns undefined), will be assigned the defaultValue by
 * reference.
 */
export function coerceToArray<T>(value: FirebaseArray<string, T>): T[];
export function coerceToArray<T>(
  value: FirebaseArray<string, T>,
  defaultValue: T,
  length: number
): T[];
export function coerceToArray<T>(
  value: Record<string, T> | T[],
  defaultValue?: T,
  length?: number
): T[] {
  if (!Array.isArray(value)) {
    const result: T[] = [];
    Object.entries(value).forEach(([key, valueAtKey]) => {
      const index = Number(key);
      if (isNaN(index)) {
        throw new Error(`Cannot coerce to array, key (${key}) is not a number`);
      }
      result[index] = valueAtKey;
    });

    if (defaultValue !== undefined && length !== undefined) {
      return fillBlanksWithValue(result, defaultValue, length);
    }
    return result;
  }
  if (defaultValue !== undefined && length !== undefined) {
    return fillBlanksWithValue(value, defaultValue, length);
  }
  return value;
}
