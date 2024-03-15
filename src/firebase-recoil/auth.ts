import { atom, AtomEffect, RecoilState } from "recoil";
import { Auth, getAuth, User } from "firebase/auth";
import { FirebaseApp } from "firebase/app";

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

function fbAuthSubscriptionEffect(auth: Auth): AtomEffect<AuthState> {
  return ({ setSelf }) => {
    // TODO look through react-redux-firebase for more sophisticated
    // auth / profile watching
    return auth.onAuthStateChanged((user) => {
      if (!user) {
        return setSelf({ isLoaded: true, isEmpty: true });
      }
      setSelf({
        isEmpty: false,
        isLoaded: true,
        // if you pass the user object directly here, recoil, in development mode,
        // freezes the object passed in, which breaks things like subsequent calls
        // to auth.signOut()
        // https://github.com/firebase/firebase-js-sdk/issues/5722
        // https://github.com/facebookexperimental/Recoil/issues/1412
        user: user && (user.toJSON() as User),
      });
    });
  };
}

export function makeAuthAtom(app: FirebaseApp): RecoilState<AuthState> {
  const auth = getAuth(app);
  return atom<AuthState>({
    key: `firebase-recoil-app:auth`,
    effects: [fbAuthSubscriptionEffect(auth)],
    default: !!auth.currentUser
      ? {
          isEmpty: false,
          isLoaded: true,
          user: auth.currentUser,
        }
      : {
          isEmpty: true,
          isLoaded: false,
        },
  });
}
