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
import type { FirebaseReadValue } from "../firebase/types";
import type { AtomFamily } from "jotai/vanilla/utils/atomFamily";
import type { Atom } from "jotai";

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

/**
 * @type PathParams - Recursively extracts parameter keys (e.g., 'key' from '/path/{key}/...')
 * @template Path - The full string literal path (e.g., '/users/{userId}/posts/{postId}')
 */
type PathParams<Path extends string> =
  // Base case: If the remaining Path is an empty string, we stop.
  Path extends ""
    ? {}
    : // Case 1: The path starts with a parameter {Key}
    Path extends `{${infer Key}}${infer End}`
    ? // Combine the current Key with the parameters from the rest of the path
      { [K in Key]: string } & PathParams<End>
    : // Case 2: The path does NOT start with a parameter (it's plain text)
    // Find the next occurrence of '{' and discard the text up to that point
    Path extends `${infer Start}{${infer Rest}`
    ? PathParams<`{${Rest}`> // Recurse on the rest of the string, starting from the next '{'
    : {}; // Case 3: No more parameters found in the rest of the path

// we curry a function to produce the actualy atom family because a detail of Typescript
// we haven't otherwise found a way around. We want the param type to be derived from the
// specific pathSpec type (value), but we've got a first type param in the signature.
// We can't type both in a single function because clients can't provide only one of the
// two type params, so they would have to redundantly provide the pathspec type (or,
// equivalently, provide a redundant param type).
export function makeAtomFamily<T extends FirebaseReadValue>(
  database: Database,
  initialValue: T
): <S extends string>(
  pathSpec: S
) => AtomFamily<PathParams<S>, Atom<T | Promise<T>>> {
  return <S extends string>(pathSpec: S) =>
    atomFamily(
      (params: PathParams<S>) =>
        atomWithStorage<T>(
          interpolatePathSpec(pathSpec, params),
          initialValue,
          firebaseStorage<T>(database),
          { getOnInit: true }
        ),
      deepEqual
    );
}

//  A version of this that doesn't work is as follows:
// export function makeAtomFamily<
//   T extends FirebaseReadValue,
//   S extends string
// >(
//   pathSpec: S,
//   database: Database,
//   initialValue: T
// ): AtomFamily<PathParams<S>, Atom<T | Promise<T>>> {
//   return atomFamily(
//     (params: PathParams<S>) =>
//       atomWithStorage<T>(
//         interpolatePathSpec(pathSpec, params),
//         initialValue,
//         firebaseStorage<T>(database),
//         { getOnInit: true }
//       ),
//     deepEqual
//   );
// }

// A form that requires a redundant type param from clients is as follows:
// export function makeAtomFamily<
//   T extends FirebaseReadValue,
//   P extends PathParameters
// >(pathSpec: string, database: Database, initialValue: T) {
//   return atomFamily(
//     (params: P) =>
//       atomWithStorage<T>(
//         interpolatePathSpec(pathSpec, params),
//         initialValue,
//         firebaseStorage<T>(database),
//         { getOnInit: true }
//       ),
//     deepEqual
//   );
// }
