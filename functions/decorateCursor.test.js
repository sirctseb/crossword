const test = require('./testConfig');

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

describe('Cursor Decoration', () => {
    // before(() => {
    //     admin.initializeApp();
    // });

    // after(() => {
    //     test.cleanup();
    //     return admin.database().ref().remove();
    // });

    describe('decorateCursor', () => {
        it('adds a users display name to the cursor', () => {
            const newCursor = test.database.makeDataSnapshot({ userId: aliceAuth.uid, row: 0, column: 0 }, '/cursors/cw-id/cursor-id');
            return wrapped(newCursor, aliceContext).then(() =>
                admin.database().ref('/cursors/cw-id/cursor-id/displayName').once('value').then(createdSnap =>
                    expect(createdSnap.val()).to.eq(aliceAuth.displayName)));
        });

        it('adds a users ')
    });
})
