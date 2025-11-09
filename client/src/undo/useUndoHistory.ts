import { useMemo } from "react";
import { ref, type DatabaseReference } from "@firebase/database";

import { UndoHistory } from "./UndoHistory";
import {
  FirebaseSet,
  type FirebaseChange,
  FirebaseUpdate,
} from "./FirebaseChange";
import { useFirebase } from "../firebase";
import type { FirebaseValue } from "../firebase/types";

interface UseUndoHistoryResult {
  history: UndoHistory;
  add: (firebaseChange: FirebaseChange, alreadyPerformed?: boolean) => void;
  set: (
    location: DatabaseReference | string,
    newValue: FirebaseValue,
    oldValue: FirebaseValue,
    alreadyPerformed?: boolean
  ) => void;
  update: (
    location: DatabaseReference | string,
    updated: Record<string, FirebaseValue>,
    undoUpdate: Record<string, FirebaseValue>,
    alreadyPerformed?: boolean
  ) => void;
}

export const useUndoHistory = (name: string): UseUndoHistoryResult => {
  const { database } = useFirebase();

  return useMemo(() => {
    const history = UndoHistory.getHistory(name);

    const add = (firebaseChange: FirebaseChange, alreadyPerformed = false) => {
      history.add(firebaseChange, alreadyPerformed);
    };

    const set = (
      location: DatabaseReference | string,
      newValue: FirebaseValue,
      oldValue: FirebaseValue,
      alreadyPerformed = false
    ) => {
      const dbRef =
        typeof location === "string" ? ref(database, location) : location;
      add(new FirebaseSet(dbRef, newValue, oldValue), alreadyPerformed);
    };

    const update = (
      location: DatabaseReference | string,
      updated: Record<string, FirebaseValue>,
      undoUpdate: Record<string, FirebaseValue>,
      alreadyPerformed = false
    ) => {
      const dbRef =
        typeof location === "string" ? ref(database, location) : location;
      add(new FirebaseUpdate(dbRef, updated, undoUpdate), alreadyPerformed);
    };

    return { history, add, set, update };
  }, [name, database]);
};
