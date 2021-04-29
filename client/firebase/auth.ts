import { atom } from 'recoil';
import firebase from './app';

const firebaseAuth = atom<firebase.User | null>({
  key: 'firebase-auth',
  default: null,
  effects_UNSTABLE: [
    ({ setSelf }) => {
      firebase.auth().onAuthStateChanged(setSelf);
    },
  ],
});
