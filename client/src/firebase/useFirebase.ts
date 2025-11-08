import type { FirebaseApp } from "firebase/app";
import type { Auth, User } from "firebase/auth";
import type { Database } from "firebase/database";
import { useAuthState } from "react-firebase-hooks/auth";
import { useMemo } from "react";
import { getFirebaseApp, getFirebaseAuth, getFirebaseDatabase } from ".";

interface UseFirebaseResult {
  database: Database;
  auth: Auth;
  app: FirebaseApp;
}

export const useFirebase = (): UseFirebaseResult => {
  return useMemo(
    () => ({
      database: getFirebaseDatabase(),
      auth: getFirebaseAuth(),
      app: getFirebaseApp(),
    }),
    []
  );
};

export interface UnloadedAuth {
  isLoaded: false;
  isEmpty: true;
}

interface LoadedEmptyAuth {
  isLoaded: true;
  isEmpty: true;
}

interface LoadedAuth {
  isLoaded: true;
  isEmpty: false;
  user: User;
}

export type AuthState = UnloadedAuth | LoadedEmptyAuth | LoadedAuth;

export const useAuth = (): AuthState => {
  const [user, loading, error] = useAuthState(getFirebaseAuth());

  if (loading) {
    return { isLoaded: false, isEmpty: true };
  }

  if (user) {
    return {
      isLoaded: true,
      isEmpty: false,
      user,
    };
  }
  return {
    isLoaded: true,
    isEmpty: true,
  };
};
