const test = require('./testConfig');
const admin = require('firebase-admin');

const { expect } = require('chai');

const functions = require('./index.js');

const wrapped = test.wrap(functions.decorateCursor);
const aliceAuth = {
  uid: 'alice',
  displayName: 'Alice Inwonderland',
  photoUrl: 'https://example.com',
};
const aliceContext = {
  auth: aliceAuth,
};

describe('Cursor Decoration', () => {
  // ensure the alice user exists
  // TODO update every time in case values change?
  before(() => admin.auth().createUser(aliceAuth).catch(() => null));

  describe('decorateCursor', () => {
    it('adds a user\'s display name to the cursor', () => {
      const newCursor = test.database.makeDataSnapshot({ userId: aliceAuth.uid, row: 0, column: 0 }, '/cursors/cw-id/cursor-id');
      return wrapped(newCursor, aliceContext).then(() =>
        admin.database().ref('/cursors/cw-id/cursor-id/displayName').once('value').then(createdSnap =>
          expect(createdSnap.val()).to.eq(aliceAuth.displayName)));
    });

    it('adds a user\'s photo url to the cursor', () => {
      const newCursor = test.database.makeDataSnapshot({ userid: aliceAuth.uid, row: 0, colum: 0 }, '/cursor/cw-id/cursor-id');
      return wrapped(newCursor, aliceContext).then(() =>
        admin.database().ref('/cursors/cw-id/cursor-id/photoUrl').once('value').then(createdSnap =>
          expect(createdSnap.val()).to.eq(aliceAuth.photoUrl)));
    });
  });
});
