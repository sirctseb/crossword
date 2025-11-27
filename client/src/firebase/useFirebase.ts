import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Database } from "firebase/database";
import { useMemo } from "react";
import {
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseDatabase,
  finishCommunalCrossword,
} from ".";

interface UseFirebaseResult {
  database: Database;
  auth: Auth;
  app: FirebaseApp;
  functions: {
    finishCommunalCrossword: typeof finishCommunalCrossword;
  };
}

export const useFirebase = (): UseFirebaseResult => {
  return useMemo(
    () => ({
      database: getFirebaseDatabase(),
      auth: getFirebaseAuth(),
      app: getFirebaseApp(),
      functions: {
        finishCommunalCrossword,
      },
    }),
    []
  );
};
