import firebase from 'firebase';

const firebaseConfig = {
  apiKey: 'AIzaSyCKj_BRXYrNVGLbTlYtq517O7hxpPnZBZ8',
  authDomain: 'crossword-dev.firebaseapp.com',
  databaseURL: 'https://crossword-dev.firebaseio.com',
  projectId: 'crossword-dev',
  storageBucket: 'crossword-dev.appspot.com',
  messagingSenderId: '960799145845',
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

interface Other {
  cool: string;
}

type Blah =
  | number
  | Other
  | {
      field: string;
      cool: number;
      ok: string;
    };

function blah(y: Blah) {
  if (typeof y !== 'number') {
    if ('ok' in y) {
    }
  }
}

type Numbery =
  | number
  | {
      myField: string;
    };
// we could try to be smart and omit number, knowing that the value can never
// be taken. actually wait, that rendering cannot be right, because that
// can take a number value
type Numbery2 = number & {
  myField: string;
};
// i mean it's just so dumb to render a type like this. it'd be fine
// cuz it just highlights a dumb type the client wrote in bolt, except
// that we have to go out of our way (type vs interface) to get it to work
// could start by just declaring everything with type instead of interface
// and not worrying about it for v1
type Numbery3 = (number | Object) & {
  myField: string;
};

type Numbery4 = (number | Object) & {
  myField?: string;
};

type Stringy3 = (string | Object) & {
  myField: string;
};

const three = (x: Numbery3) => {
  const y: Numbery3 = 3;
  const z: Numbery3 = { myField: 'cool' };
  if (typeof x === 'number') {
    num(x);
  }
  if (!('myField' in x)) {
    num(x);
  }
};

const sthree = (x: Stringy3) => {
  if (typeof x === 'number') {
    num(x);
  }
};

const obj = (x: Object) => {};

const num = (x: number) => {};

export default firebase;
