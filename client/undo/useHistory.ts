import { useMemo } from 'react';
import firebase from 'firebase';
import FirebaseChange, { FirebaseAssignment } from './FirebaseChange';
import UndoHistory from './UndoHistory';
import useFirebase from '../hooks/useFirebase';

interface UseHistoryResult {
  history: UndoHistory;
  add: (firebaseChange: FirebaseChange, alreadyPerformed?: boolean) => void;
  addValues: (
    location: firebase.database.Reference | string,
    newValue: FirebaseAssignment,
    oldValue: FirebaseAssignment,
    alreadyPerformed?: boolean
  ) => void;
}

const useHistory = (name: string): UseHistoryResult => {
  const { root } = useFirebase();
  return useMemo(() => {
    const history = UndoHistory.getHistory(name);
    return {
      history: UndoHistory.getHistory(name),
      add: (change, alreadyPerformed?) => history.add(change, alreadyPerformed),
      addValues: (location, newValue, oldValue, alreadyPerformed?) => {
        const ref = typeof location === 'string' ? root.child(location) : location;
        history.add(FirebaseChange.FromValues(ref, newValue, oldValue), alreadyPerformed);
      },
    };
  }, [name]);
};

export default useHistory;
