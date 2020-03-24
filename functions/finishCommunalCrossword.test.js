const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.use(sinonChai);
const test = require('./testConfig');

const { expect } = chai;

const functions = require('./index.js');
const admin = require('firebase-admin');

const wrapped = test.wrap(functions.finishCommunalCrossword);
const snapVal = snap => snap.val();

const aliceAuth = {
  uid: 'alice',
  displayName: 'Alice Inwonderland',
  photoUrl: 'photoUrl',
};
const aliceContext = {
  auth: aliceAuth,
};

const nonFullCrossword = {
  rows: 2,
  symmetric: true,
  global: true,
  boxes: {
    0: { 0: { content: 'A' }, 1: { blocked: true } },
    1: { 0: { content: 'A' } },
  },
};

const fullCrossword = {
  rows: 2,
  symmetric: true,
  global: true,
  boxes: {
    0: { 0: { content: 'A' }, 1: { content: 'A' } },
    1: { 0: { content: 'A' }, 1: { blocked: true } },
  },
};

describe('finishCommunalCrossword', () => {
  describe('with non-full crossword', () => {
    beforeEach(() => admin.database().ref().set({
      crosswords: { 'communal-id': nonFullCrossword },
      communalCrossword: { current: 'communal-id' },
    }));

    it('refuses if the crossword is not full', () => Promise.all([
      expect(wrapped({}, aliceContext)).to.be.rejected,
      expect(admin.database().ref('communalCrossword/current').once('value').then(snapVal)).to.become('communal-id'),
      expect(admin.database().ref('permissions/communal-id/readonly').once('value')).not.to.become(true),
    ]));
  });

  describe('with a full crossword', () => {
    beforeEach(() => admin.database().ref().set({
      crosswords: { 'communal-id': fullCrossword },
      communalCrossword: { current: 'communal-id' },
    }));

    it('sets the readonly flag on the current puzzle', () =>
      expect(wrapped({}, aliceContext)).to.be.fulfilled.then(() =>
        expect(admin.database().ref('/permissions/communal-id/readonly')
          .once('value').then(snapVal)).to.become(true)));

    it('adds the current puzzle to the archive', () => {
      const added = sinon.spy();
      const crosswordsRef = admin.database().ref('communalCrossword/archive');
      crosswordsRef.on('child_added', added);
      return expect(wrapped({}, aliceContext)).to.be.fulfilled.then(() => Promise.all([
        expect(added).to.have.been.calledOnceWith(sinon.match(snap => snap.val() === 'communal-id')),
        expect(admin.database().ref('/communalCrossword/archive')
          .once('value').then(snapVal).then(Object.values)).to.eventually.contain('communal-id'),
      ]));
    });

    it('creates a new global, non-readonly crossword', () => {
      const added = sinon.spy();
      const crosswordsRef = admin.database().ref('crosswords');
      crosswordsRef.on('child_added', added);
      return expect(wrapped({}, aliceContext)).to.be.fulfilled.then(() =>
        expect(added).to.have.been.calledTwice).then(() => crosswordsRef.off());
    });

    it('sets the new puzzle as the current communal puzzle', () => {
      let newKey;
      const added = sinon.spy((data) => { newKey = data.key; });
      const crosswordsRef = admin.database().ref('crosswords');
      crosswordsRef.on('child_added', added);
      return expect(wrapped({}, aliceContext)).to.be.fulfilled.then(() => Promise.all([
        expect(added).to.have.been.calledTwice,
        expect(admin.database().ref('communalCrossword/current').once('value').then(snapVal)).to.become(newKey),
        expect(newKey).not.to.eql(null),
        expect(newKey).not.to.eql('communal-id'),
        expect(admin.database().ref(`permissions/${newKey}`).once('value').then(snapVal)).to.eventually.deep.equal({ global: true }),
      ])).then(() => crosswordsRef.off());
    });
  });
});
