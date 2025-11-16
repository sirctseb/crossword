import { atom } from "jotai";
import { getAuth, User } from "firebase/auth";

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

const auth = getAuth();

export const authAtom = atom<AuthState>(
  auth.currentUser
    ? {
        isLoaded: true,
        isEmpty: false,
        user: auth.currentUser,
      }
    : {
        isLoaded: false,
        isEmpty: true,
      }
);

authAtom.onMount = (setSelf) => {
  return auth.onAuthStateChanged((user) => {
    if (!user) {
      return setSelf({ isLoaded: true, isEmpty: true });
    }
    setSelf({
      isEmpty: false,
      isLoaded: true,
      user,
    });
  });
};
