import { atom, AtomEffect, RecoilState } from "recoil";
import { Auth, getAuth, User } from "firebase/auth";
import { FirebaseApp } from "firebase/app";

interface AuthState {
  isLoaded: boolean;
  isEmpty: boolean;
  user: User | null;
}

function fbAuthSubscriptionEffect(auth: Auth): AtomEffect<AuthState> {
  return ({ setSelf }) => {
    // TODO look through react-redux-firebase for more sophisticated
    // auth / profile watching
    return auth.onAuthStateChanged((user) => {
      setSelf({
        isEmpty: !user,
        isLoaded: true,
        user,
      });
    });
  };
}

export function makeAuthAtom(app: FirebaseApp): RecoilState<AuthState> {
  const auth = getAuth(app);
  return atom<AuthState>({
    key: `firebase-recoil-app:auth`,
    effects: [fbAuthSubscriptionEffect(auth)],
    // TODO is there a synchronous way to get initial value for empty / loaded?
    default: {
      isEmpty: false,
      isLoaded: false,
      user: auth.currentUser,
    },
  });
}
