const functions = require('firebase-functions');
const admin = require('firebase-admin');

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
    snapshot.ref.child('displayName').set(context.auth.displayName));

exports.registerUser = functions.auth.user().onCreate(user =>
    functions.database.ref(`users/${user.uid}/avatarUrl`).set(user.photoUrl));
