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
import { getDatabase, type Database } from "firebase/database";
import { getFunctions, httpsCallable } from "firebase/functions";

export * from "./useFirebase";

const globalFirebase = initializeApp(settings.firebase);

export function getFirebaseApp(): FirebaseApp {
  return globalFirebase;
}

export function getFirebaseAuth(): Auth {
  return getAuth(globalFirebase);
}

export function getFirebaseDatabase(): Database {
  return getDatabase(globalFirebase);
}

// TODO Declare the args and return types so the functions and client
// code can both refer to them
const functions = getFunctions();
export const finishCommunalCrossword = httpsCallable<{}, {}>(
  functions,
  "finishCommunalCrossword"
);

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
