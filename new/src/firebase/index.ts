import {
  Auth,
  getAuth,
  EmailAuthProvider,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
} from "firebase/auth";
import { FirebaseApp, initializeApp } from "firebase/app";
import { settings } from "../settings/Settings";

const globalFirebase = initializeApp(settings.firebase);

export function getFirebaseApp(): FirebaseApp {
  return globalFirebase;
}

export function getFirebaseAuth(): Auth {
  return getAuth(globalFirebase);
}

export const firebaseAuthConfig = {
  autoUpgradeAnonymousUsers: true,
  callbacks: {
    uiShown: () => {
      // TODO ? example code hides a loader
    },
  },
  signInFlow: "popup",
  // TODO can we come back to whatever the current url is?
  signInSuccessUrl: "/",
  signInOptions: [
    EmailAuthProvider.PROVIDER_ID,
    GoogleAuthProvider.PROVIDER_ID,
    FacebookAuthProvider.PROVIDER_ID,
    TwitterAuthProvider.PROVIDER_ID,
  ],
  // TODO what are these used for?
  tosUrl: "/tos",
  privacyPolicyUrl: "/privacy",
};
