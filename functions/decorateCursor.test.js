const test = require('firebase-functions-test')({
    apiKey: 'AIzaSyB1q2fH7XjhzGtr2Ed8WJAsV7JzUtynI9E',
    authDomain: 'crossword-test-1149f.firebaseapp.com',
    databaseURL: 'https://crossword-test-1149f.firebaseio.com',
    projectId: 'crossword-test-1149f',
    storageBucket: '',
    messagingSenderId: '275025952215',
    appId: '1:275025952215:web:994a396f098d4620',
}, './crossword-test-1149f-5dac7f05770a.json');

const { expect } = require('chai');

// TODO mock initializeApp for index.js if we use it there
const functions = require('./index.js');
const admin = require('firebase-admin');

const wrapped = test.wrap(functions.decorateCursor);
const aliceAuth = {
    uid: 'alice',
    displayName: 'Alice Inwonderland',
};
const aliceContext = {
    auth: aliceAuth,
};

describe('cloud functions', () => {
    before(() => {
        admin.initializeApp();
    });

    after(() => {
        test.cleanup();
        return admin.database().ref().remove();
    });

    describe('decorateCursor', () => {
        it('adds a users display name to the cursor', () => {
            const newCursor = test.database.makeDataSnapshot({ userId: aliceAuth.uid, row: 0, column: 0 }, '/cursors/cw-id/cursor-id');
            return wrapped(newCursor, aliceContext).then(() =>
                admin.database().ref('/cursors/cw-id/cursor-id/displayName').once('value').then(createdSnap =>
                    expect(createdSnap.val()).to.eq(aliceAuth.displayName)));
        });
    });
})
