import firebaseApp from '../firebaseApp';

const functions = firebaseApp.functions();

firebaseApp.functions().httpsCallable('matchingAnswers');

export const matchingAnswers = functions.httpsCallable('matchingAnswers');
