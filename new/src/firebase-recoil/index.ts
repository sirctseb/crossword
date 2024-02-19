import {
  atom,
  AtomEffect,
  atomFamily,
  RecoilState,
  type SerializableParam,
} from "recoil";
import { Database, DataSnapshot, ref, onValue, get } from "firebase/database";
import { interpolatePathSpec, PathParameters } from "./interpolatePathSpec";
import type { FirebaseArray } from "../firebase/types";

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

type PP<K extends string> = {
  [Property in K]: string;
};

function test<T extends string>(pathSpec: string, args: PP<T>): string {
  return "hi";
}

const x = test<"key1" | "key2">("ok", { key1: "hi", key2: "hi" });

type IsParameter<Part> = Part extends `{${infer ParamName}}`
  ? ParamName
  : never;
type FilteredParts<Path> = Path extends `${infer PartA}/${infer PartB}`
  ? IsParameter<PartA> | FilteredParts<PartB>
  : IsParameter<Path>;
type ParamValue<Key> = Key extends `...${infer Anything}` ? string[] : string;
type RemovePrefixDots<Key> = Key extends `...${infer Name}` ? Name : Key;
type Params<Path> = {
  [Key in FilteredParts<Path> as RemovePrefixDots<Key>]: ParamValue<Key>;
};
type CallbackFn<Path> = (req: { params: Params<Path> }) => void;

function get2<Path extends string = string>(
  path: Path,
  callback: CallbackFn<Path>
) {
  // TODO: implement
}

function make2<Path extends string = string>(path: Path): CallbackFn<Path> {
  return (req) => {};
}

const makeCallback = make2("/hi/{there}/cool")({ params: { there: "hi" } });

get2("hi/{there}/cool", ({ params: { there } }) => {});

const db: Database = {};

const af = makeAtomFamily("/hi/{there}/cool", db);
af({ there: "ok" });
af({ shouldFail: "ok" });

//https://github.com/microsoft/TypeScript/pull/26349
const af2 = makeAtomFamily<number>("/hi/{there}/cool", db);
af2({ there: "ok" });
af2({ shouldFail: "ok" });

function omg<T extends string, N extends number>(t: T, n: N): { x: T; y: N } {
  return { x: t, y: n };
}

omg("cool", 3);
// omg<string>("ok", 2);

export function makeAtomFamilyMaker<T extends FirebaseValue>(
  database: Database
): <Path extends string>(
  pathSpec: Path,
  database: Database
) => (pathSpec: Path) => RecoilState<T> {
  return (pathSpec) => makeAtomFamily(pathSpec, database);
}

type KnownPathSpecAtomMaker<T extends FirebaseValue> = <T>() => RecoilState<T>;

export function otherWay<Path extends string>(
  pathSpec: Path,
  database: Database
): KnownPathSpecAtomMaker<T> {}

export function makeAtomFamily<
  T extends FirebaseValue,
  Path extends string
  // P extends Params<Path> & SerializableParam = Params<Path>
>(pathSpec: Path, database: Database): (param: Params<Path>) => RecoilState<T> {
  // TODO if we have some unique id for the app, we can include in the key
  // and support multiple firebase connections
  return atomFamily<T, Params<Path>>({
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
