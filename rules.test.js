import chai, { expect } from 'chai';
import chaiAsExpected from 'chai-as-promised';
import dirtyChai from 'dirty-chai';
import fs from 'fs';

chai.use(chaiAsExpected);
chai.use(dirtyChai);

const firebase = require('@firebase/testing');

const databaseName = 'crossword-dev';
const alice = 'alice';
const bob = 'bob';
const charlie = 'charlie';

const authedApp = auth => firebase.initializeTestApp({
  databaseName,
  auth,
}).database();

const adminApp = () => firebase.initializeAdminApp({ databaseName }).database();

const rules = fs.readFileSync('rules.json', 'utf-8');

before((done) => {
  firebase.loadDatabaseRules({ databaseName, rules })
    .then(done);
});

beforeEach(() => adminApp().ref().set(null));

after(() => {
  Promise.all(firebase.apps().map(a => a.delete()));
});

describe('crossword', () => {
  it('can be created if specifying permissions and owner entry', () => {
    const app = authedApp({ uid: alice });

    return expect(app.ref().update({
      'crosswords/cw-id': { rows: 15, symmetric: true, title: 'untitled' },
      [`users/${alice}/crosswords/cw-id`]: {
        title: 'Untitled',
      },
      'permissions/cw-id': { owner: alice },
    })).to.be.fulfilled();
  });

  it('cannot be created without specifying permissions', () => {
    const app = authedApp({ uid: alice });

    return expect(app.ref().update({
      'crosswords/cw-id': { rows: 15, symmetric: true, title: 'untitled' },
      [`users/${alice}/crosswords/cw-id`]: {
        title: 'Untitled',
      },
      // 'permissions/cw-id': { owner: uid },
    })).to.be.rejected();
  });

  it('cannot be created without owner entry', () => {
    const app = authedApp({ uid: alice });

    return expect(app.ref().update({
      'crosswords/cw-id': { rows: 15, symmetric: true, title: 'untitled' },
      // [`users/${alice}/crosswords/cw-id`]: {
      //     title: 'Untitled',
      // },
      'permissions/cw-id': { owner: alice },
    })).to.be.rejected();
  });

  it('cannot be created under another users id', () => {
    const app = authedApp({ uid: alice });

    return expect(app.ref().update({
      'crosswords/cw-id': { rows: 15, symmetric: true, title: 'untitled' },
      [`users/${alice}/crosswords/cw-id`]: {
        title: 'Untitled',
      },
      'permissions/cw-id': { owner: bob },
    })).to.be.rejected();
  });
});

describe('cursor', () => {
  describe('with cw in place', () => {
    beforeEach(() =>
      adminApp().ref().update({
        'crosswords/cw-id': { rows: 15, symmetric: true, title: 'untitled' },
        [`users/${alice}/crosswords/cw-id`]: {
          title: 'Untitled',
        },
        'permissions/cw-id': { owner: alice, collaborators: { bob: true } },
      }));

    it('can be created', () => {
      const app = authedApp({ uid: alice });
      return expect(app.ref().update({
        'cursors/cw-id/cursor-id': {
          userId: alice,
        },
      })).to.be.fulfilled();
    });

    it('cannot be created under another users id', () => {
      const app = authedApp({ uid: alice });
      return expect(app.ref().update({
        'cursors/cw-id/cursor-id': {
          userId: bob,
        },
      })).to.be.rejected();
    });

    describe('with existing cursor', () => {
      beforeEach(() =>
        adminApp().ref().update({
          'cursors/cw-id/cursor-id': {
            userId: alice,
            row: 0,
            column: 0,
          },
        }));

      it('cannot be deleted by another user', () => {
        const app = authedApp({ uid: bob });
        return expect(app.ref('cursors/cw-id/cursor-id').set(null)).to.be.rejected();
      });

      it('can be deleted by owner', () => {
        const app = authedApp({ uid: alice });
        return expect(app.ref('cursors/cw-id/cursor-id').set(null)).to.be.fulfilled();
      });

      it('can be read by owner', () => {
        const app = authedApp({ uid: alice });
        return expect(app.ref('cursors/cw-id/cursor-id').once('value')).to.be.fulfilled();
      });

      it('can be read by collaborator', () => {
        const app = authedApp({ uid: bob });
        return expect(app.ref('cursors/cw-id/cursor-id').once('value')).to.be.fulfilled();
      });

      it('cannot be read by non-owner non-collaborator', () => {
        const app = authedApp({ uid: charlie });
        return expect(app.ref('cursors/cw-id/cursor-id').once('value')).to.be.rejected();
      });
    });
  });

  describe('with no cw in place', () => {
    it('cannot be created', () => {
      const app = authedApp({ uid: alice });
      return expect(app.ref().update({
        'cursors/cw-id/cursor-id': {
          userId: alice,
        },
      })).to.be.rejected();
    });
  });
});
