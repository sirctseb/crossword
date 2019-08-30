const test = require('./testConfig');

const { expect } = require('chai');

const functions = require('./index.js');
const admin = require('firebase-admin');

const photoUrl = 'photoUrl';

const userRecord = {
    photoUrl,
};

const wrapped = test.wrap(functions.registerUser);
// const aliceAuth = {
//     uid: 'alice',
//     displayName: 'Alice Inwonderland',
// };
// const aliceContext = {
//     auth: aliceAuth,
// };

describe('User Registration', () => {
    // before(() => {
    //     admin.initializeApp();
    // });

    // after(() => {
    //     test.cleanup();
    //     return admin.database().ref().remove();
    // });

    describe('registerUser', () => {
        it('sets the avatarUrl in the users data', () => {
            // const newCursor = test.database.makeDataSnapshot({ userId: aliceAuth.uid, row: 0, column: 0 }, '/cursors/cw-id/cursor-id');
            return wrapped(userRecord/*, aliceContext*/).then(() =>
                admin.database().ref('/users/alice/avatarUrl').once('value').then(createdSnap =>
                    expect(createdSnap.val()).to.eq(photoUrl)));
        });
    });
})
