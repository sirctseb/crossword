import firebase from 'firebase';

const firebaseConfig = {
  apiKey: 'AIzaSyCKj_BRXYrNVGLbTlYtq517O7hxpPnZBZ8',
  authDomain: 'crossword-dev.firebaseapp.com',
  databaseURL: 'https://crossword-dev.firebaseio.com',
  projectId: 'crossword-dev',
  storageBucket: 'crossword-dev.appspot.com',
  messagingSenderId: '960799145845',
};


firebase.initializeApp(firebaseConfig);

export default firebase;
