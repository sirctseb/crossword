import { atom, AtomEffect, atomFamily, SerializableParam } from 'recoil';
import firebase from 'firebase';

export type BoltMap<Key extends string, Value> = Record<Key, Value>;
export type FirebaseValue = boolean | string | number | Object;

export function fbValueSubscriptionEffect<T extends FirebaseValue>(path: string): AtomEffect<T> {
  return ({ setSelf }) => {
    const handler = (snapshot: firebase.database.DataSnapshot | null) => setSelf(snapshot?.val());
    // TODO you can't use the value returned by .on because they have it typed differently than the param
    // to .off
    firebase.database().ref(path).on('value', handler);
    return () => firebase.database().ref(path).off('value', handler);
  };
}

export function makeAtom<T extends FirebaseValue>(path: string) {
  return atom<T>({
    key: `fb:${path}`,
    effects_UNSTABLE: [fbValueSubscriptionEffect<T>(path)],
    // TODO find out whether this or initializing in effect is better
    default: firebase
      .database()
      .ref(path)
      .once('value')
      .then((snapshot) => snapshot.val()),
  });
}

export function makeAtomFamily<T extends FirebaseValue, P extends PathParameters>(pathSpec: string) {
  return atomFamily<T, P>({
    key: `fb:${pathSpec}`,
    effects_UNSTABLE: (params) => [
      // TODO what would happen if we threw an exception here?
      fbValueSubscriptionEffect<T>(interpolatePathSpec(pathSpec, params)),
    ],
    // TODO find out whether this or initializing in effect is better
    default: async (params) => {
      return await firebase
        .database()
        .ref(interpolatePathSpec(pathSpec, params))
        .once('value')
        .then((snapshot) => snapshot.val());
    },
  });
}

class OverspecError extends Error {
  constructor(pathSpec: string, params: SerializableParam, notFound: string) {
    super(
      `Failed to interpolate ${params?.toString()} into ${pathSpec}. Found ${notFound} in params but not path spec`
    );
  }
}

class UnderspecError extends Error {
  constructor(pathSpec: string, params: SerializableParam, notFound: string[] | null) {
    super(
      `Failed to interpolate ${params?.toString()} into ${pathSpec}. Found ${notFound?.join(
        ','
      )} in path spec but not params`
    );
  }
}

// TODO is there any way to say something must be a map from strings to strings
// but not say that it can be a map from _any_ string?
export interface PathParameters extends Record<string, string> {}

// this type param problably doesn't do anything for us
// maybe it does because we could write a type guard on the pathSpec string
// TODO this is internal to the libary. maybe there's a public interface that
// supports a generic data loader, but otherwise if we verify the bolt file right,
// we don't actually have to worry about error handling here
function interpolatePathSpec<P extends PathParameters>(pathSpec: string, params: P): string {
  // for every key, myKey, in params, we expect to see a substring {myKey} in the pathSpec
  // curly brances are otherwise not legal in pathSpecs TODO confirm that
  // validate resulting string?
  // TODO can a path parameter appear more than once in a path spec?
  const innerInterpolated = Object.entries(params).reduce((existingPathSpec, [key, value]) => {
    const keyMarker = `{${key}}`;
    if (existingPathSpec.includes(keyMarker)) {
      return existingPathSpec.replace(`{${key}}`, value);
    } else {
      throw new OverspecError(pathSpec, params, key);
    }
  }, pathSpec);

  const remainingParamMarkersRegex = /\{([^}])\}/;

  if (remainingParamMarkersRegex.test(innerInterpolated)) {
    // TODO unit test this extraction of unmatched markers
    throw new UnderspecError(pathSpec, params, pathSpec.match(remainingParamMarkersRegex));
  }

  return innerInterpolated;

  // TODO for array notation, there won't be a curly-braced entry, we'll just have to add it
  // to the end
}
