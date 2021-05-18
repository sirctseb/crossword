import firebase from 'firebase';
import { useMemo } from 'react';
import { FirebaseValue } from '../firebase-recoil/static';

interface UseFirebaseResult {
  // Set a value at a given path
  set: (path: string, value: FirebaseValue) => Promise<any>;
  // A reference to the root of the db
  ref: firebase.database.Reference;
}

const useFirebase = (): UseFirebaseResult => {
  return useMemo(
    () => ({
      set: (path, value) => firebase.database().ref(path).set(value),
      ref: firebase.database().ref(),
    }),
    []
  );
};

export default useFirebase;
