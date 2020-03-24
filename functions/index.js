const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.helloWorld = functions.https.onCall(() => 'hello world');

const words = [
  'bat',
  'bar',
  'bit',
  'car',
  'cat',
  'cab',
];

exports.matchingAnswers = functions.https.onCall(({ regex }) =>
  words.filter(word => word.match(regex)));

exports.decorateCursor = functions.database.ref('/cursors/{crosswordId}/{cursorId}').onCreate((snapshot, context) =>
  snapshot.ref.update({
    displayName: context.auth.displayName,
    photoUrl: context.auth.photoUrl,
  }));

const snapVal = snap => snap.val();

exports.finishCommunalCrossword = functions.https.onCall(() =>
  admin.database().ref('/communalCrossword/current').once('value').then(snapVal)
    .then(currentId => admin.database().ref('/crosswords').child(currentId).once('value')
      .then((crosswordSnap) => {
        const crossword = crosswordSnap.val();
        const { rows } = crossword;
        const range = [...Array(rows).keys()];
        if (range.every(row => range.every((column) => {
          if (crossword.boxes.hasOwnProperty(row) && crossword.boxes[row].hasOwnProperty(column)) {
            const { content, blocked } = crossword.boxes[row][column];
            return content || blocked;
          }
          return false;
        }))) {
          const ref = admin.database().ref();
          const newCrosswordId = ref.push().key;
          const newArchiveEntry = ref.push().key;
          return ref.update({
            [`/permissions/${currentId}/readonly`]: true,
            [`/communalCrossword/archive/${newArchiveEntry}`]: currentId,
            '/communalCrossword/current': newCrosswordId,
            [`/crosswords/${newCrosswordId}`]: { rows: 15, symmetric: true, title: `Puzzle - ${Date()}` },
            [`/permissions/${newCrosswordId}/global`]: true,
          });
        }
        throw new Error('Crossword not complete');
      })));
