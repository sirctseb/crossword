const functions = require('firebase-functions');

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
