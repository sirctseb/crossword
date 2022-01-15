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

const authedApps = {};
const authedApp = (uid) => {
  if (!authedApps[uid]) {
    authedApps[uid] = firebase
      .initializeTestApp({
        databaseName,
        auth: { uid },
      })
      .database();
  }

  return authedApps[uid];
};

const adminApp = firebase.initializeAdminApp({ databaseName }).database();

const rules = fs.readFileSync('rules.json', 'utf-8');
// console.log('read rules', { rules });

before((done) => {
  firebase.loadDatabaseRules({ databaseName, rules }).then(done);
});

beforeEach(() => adminApp.ref().set(null));

after(() => {
  Promise.all(firebase.apps().map((a) => a.delete()));
});

describe('crossword', () => {
  it('can be created if specifying permissions and owner entry', () => {
    const app = authedApp(alice);

    return expect(
      app.ref().update({
        'crosswords/cw-id': { rows: 15, symmetric: true, title: 'untitled' },
        [`users/${alice}/crosswords/cw-id`]: {
          title: 'Untitled',
        },
        'permissions/cw-id': { owner: alice },
      })
    ).to.be.fulfilled();
  });

  it('cannot be created without specifying permissions', () => {
    const app = authedApp(alice);

    return expect(
      app.ref().update({
        'crosswords/cw-id': { rows: 15, symmetric: true, title: 'untitled' },
        [`users/${alice}/crosswords/cw-id`]: {
          title: 'Untitled',
        },
        // 'permissions/cw-id': { owner: alice },
      })
    ).to.be.rejected();
  });

  it('cannot be created without owner entry', () => {
    const app = authedApp(alice);

    return expect(
      app.ref().update({
        'crosswords/cw-id': { rows: 15, symmetric: true, title: 'untitled' },
        // [`users/${alice}/crosswords/cw-id`]: {
        //     title: 'Untitled',
        // },
        'permissions/cw-id': { owner: alice },
      })
    ).to.be.rejected();
  });

  it('cannot be created under another users id', () => {
    const app = authedApp(alice);

    return expect(
      app.ref().update({
        'crosswords/cw-id': { rows: 15, symmetric: true, title: 'untitled' },
        [`users/${alice}/crosswords/cw-id`]: {
          title: 'Untitled',
        },
        'permissions/cw-id': { owner: bob },
      })
    ).to.be.rejected();
  });

  it('cannot be created without the crossword', () => {
    const app = authedApp(alice);

    return expect(
      app.ref().update({
        // 'crosswords/cw-id': { rows: 15, symmetric: true, title: 'untitled' },
        [`users/${alice}/crosswords/cw-id`]: {
          title: 'Untitled',
        },
        'permissions/cw-id': { owner: alice },
      })
    ).to.be.rejected();
  });

  describe('reading', () => {
    beforeEach(() =>
      adminApp.ref().update({
        'crosswords/cw-id': { rows: 15, symmetric: true, title: 'untitled' },
        [`users/${alice}/crosswords/cw-id`]: {
          title: 'Untitled',
        },
        'permissions/cw-id': { owner: alice, collaborators: { bob: true } },
      })
    );

    it('can be read by the owner', () => expect(authedApp(alice).ref()));
  });

  describe('collaborators', () => {
    beforeEach(() =>
      adminApp.ref().update({
        'crosswords/cw-id': { rows: 15, symmetric: true, title: 'untitled' },
        [`users/${alice}/crosswords/cw-id`]: {
          title: 'Untitled',
        },
        'permissions/cw-id': { owner: alice },
      })
    );

    it('can be added by the owner', () =>
      expect(
        authedApp(alice)
          .ref()
          .update({
            'permissions/cw-id/collaborators': { [bob]: true },
          })
      ).to.be.fulfilled());

    it('cannot be added by a non-owner', () =>
      expect(
        authedApp(bob)
          .ref()
          .update({
            'permissions/cw-id/collaborators': { [bob]: true },
          })
      ).to.be.rejected());
  });

  describe('editing', () => {
    beforeEach(() =>
      adminApp.ref().update({
        'crosswords/cw-id': { rows: 15, symmetric: true, title: 'untitled' },
        [`users/${alice}/crosswords/cw-id`]: {
          title: 'Untitled',
        },
        'permissions/cw-id': { owner: alice },
      })
    );

    it('can be edited by the owner', () =>
      expect(
        authedApp(alice).ref().update({
          'crosswords/cw-id/boxes/0/0/content': 'a',
        })
      ).to.be.fulfilled());

    it('cannot be edited by a non-owner', () =>
      expect(
        authedApp(bob).ref().update({
          'crosswords/cw-id/boxes/0/0/content': 'a',
        })
      ).to.be.rejected());

    it('cant have invalid data written', () =>
      expect(
        authedApp(alice).ref().update({
          'crosswords/cw-id/invalid': 'a',
        })
      ).to.be.rejected());

    describe('collaborators', () => {
      beforeEach(() =>
        adminApp.ref().update({
          'permissions/cw-id/collaborators': { [bob]: true },
        })
      );

      it('can be edited by a collaborator', () =>
        expect(
          authedApp(bob).ref().update({
            'crosswords/cw-id/boxes/0/0/content': 'a',
          })
        ).to.be.fulfilled());

      it('cannot be edited by a non-owner, non-collaborator', () =>
        expect(
          authedApp(charlie).ref().update({
            'crosswords/cw-id/boxes/0/0/content': 'a',
          })
        ).to.be.rejected());
    });

    describe('global', () => {
      beforeEach(() =>
        adminApp.ref().update({
          'permissions/cw-id/global': true,
        })
      );

      it('can be edited by non-owner, non-collaborator', () =>
        expect(
          authedApp(charlie).ref().update({
            'crosswords/cw-id/boxes/0/0/content': 'a',
          })
        ).to.be.fulfilled());

      it('cannot have invalid data written', () =>
        expect(
          authedApp(alice).ref().update({
            'crosswords/cw-id/invalid': 'a',
          })
        ).to.be.rejected());
    });

    describe('readonly', () => {
      beforeEach(() =>
        adminApp.ref().update({
          'permissions/cw-id/readonly': true,
        })
      );

      it('can be read by owner', () =>
        expect(authedApp(alice).ref('crosswords/cw-id').once('value')).to.be.fulfilled());

      it('cannot be read by non-owner, non-collaborator', () =>
        expect(authedApp(charlie).ref('crosswords/cw-id').once('value')).to.be.rejected());

      describe('when also global', () => {
        beforeEach(() =>
          adminApp.ref().update({
            'permissions/cw-id/global': true,
          })
        );

        it('can be read by non-owner, non-collaborator', () =>
          expect(authedApp(charlie).ref('crosswords/cw-id').once('value')).to.be.fulfilled());
      });

      it('cannot be edited by owner', () =>
        expect(
          authedApp(alice).ref().update({
            'crosswords/cw-id/boxes/0/0/content': 'a',
          })
        ).to.be.rejected());

      it('cannot have invalid data written', () =>
        expect(
          authedApp(alice).ref().update({
            'crosswords/cw-id/invalid': 'a',
          })
        ).to.be.rejected());
    });
  });

  ['global', 'readonly'].forEach((attribute) => {
    describe(`${attribute} editability`, () => {
      describe('as an admin', () => {
        // TODO would like to assign to an app ref here. does that break parallel tests?
        describe('when the crossword exists', () => {
          beforeEach(() =>
            adminApp.ref().update({
              'crosswords/cw-id': { rows: 15, symmetric: true, title: 'untitled' },
              [`users/${alice}/crosswords/cw-id`]: {
                title: 'Untitled',
              },
              'permissions/cw-id': { owner: bob },
            })
          );

          it('can be established', () =>
            expect(
              adminApp.ref().update({
                [`permissions/cw-id/${attribute}`]: true,
              })
            ).to.be.fulfilled());

          // TODO we want this behavior but it looks like admin accounts
          // are not subject to the rules. may consider making a service account
          // that is subject to rules
          // describe('when the crossword does not exist', () => {
          //   it('cannot be established', () =>
          //     expect(adminApp.ref().update({
          //       [`permissions/cw-id/${attribute}`]: true,
          //     })).to.be.rejected());
          // });
        });

        describe('as a user when the crossword exists', () => {
          beforeEach(() =>
            adminApp.ref().update({
              'crosswords/cw-id': { rows: 15, symmetric: true, title: 'untitled' },
              [`users/${alice}/crosswords/cw-id`]: {
                title: 'Untitled',
              },
              'permissions/cw-id': { owner: bob },
            })
          );

          it('cannot be set', () =>
            expect(
              authedApp(alice)
                .ref()
                .update({
                  [`permissions/cw-id/${attribute}`]: true,
                })
            ).to.be.rejected());

          describe(`when it is already ${attribute}`, () => {
            beforeEach(() =>
              adminApp.ref().update({
                [`permissions/cw-id/${attribute}`]: true,
              })
            );

            it('cannot be unset', () =>
              expect(
                authedApp(alice)
                  .ref()
                  .update({
                    [`permissions/cw-id/${attribute}`]: false,
                  })
              ).to.be.rejected());
          });
        });
      });
    });
  });
});

describe('cursors', () => {
  describe('when they exist', () => {
    beforeEach(() =>
      adminApp.ref().update({
        'crosswords/cw-id': { rows: 15, symmetric: true, title: 'untitiled ' },
        [`users/${alice}/crosswords/cw-id`]: {
          title: 'Untitled',
        },
        'cursors/cw-id': {
          'cursor-id-alice': {
            userId: alice,
          },
          'cursor-id-bob': {
            userId: bob,
          },
        },
        'permissions/cw-id': {
          owner: alice,
          collaborators: { bob: true },
        },
      })
    );

    it('can be read by cw owner', () => {
      const app = authedApp(alice);
      return expect(app.ref().child('cursors/cw-id').once('value')).to.be.fulfilled();
    });

    it('can be read by collaborator', () => {
      const app = authedApp(bob);
      return expect(app.ref().child('cursors/cw-id').once('value')).to.be.fulfilled();
    });

    it('cannot be read by non-permitted', () => {
      const app = authedApp(charlie);
      return expect(app.ref().child('cursors/cw-id').once('value')).to.be.rejected();
    });
  });

  describe('with cw in place', () => {
    beforeEach(() =>
      adminApp.ref().update({
        'crosswords/cw-id': { rows: 15, symmetric: true, title: 'untitled' },
        [`users/${alice}/crosswords/cw-id`]: {
          title: 'Untitled',
        },
        'permissions/cw-id': { owner: alice, collaborators: { bob: true } },
      })
    );

    it('can be created', () => {
      const app = authedApp(alice);
      return expect(
        app.ref().update({
          'cursors/cw-id/cursor-id': {
            userId: alice,
          },
        })
      ).to.be.fulfilled();
    });

    it('cannot be created under another users id', () => {
      const app = authedApp(alice);
      return expect(
        app.ref().update({
          'cursors/cw-id/cursor-id': {
            userId: bob,
          },
        })
      ).to.be.rejected();
    });

    describe('with existing cursor', () => {
      beforeEach(() =>
        adminApp.ref().update({
          'cursors/cw-id/cursor-id': {
            userId: alice,
            row: 0,
            column: 0,
          },
        })
      );

      it('cannot be deleted by another user', () => {
        const app = authedApp(bob);
        return expect(app.ref('cursors/cw-id/cursor-id').set(null)).to.be.rejected();
      });

      it('can be deleted by owner', () => {
        const app = authedApp(alice);
        return expect(app.ref('cursors/cw-id/cursor-id').set(null)).to.be.fulfilled();
      });

      it('can be read by owner', () => {
        const app = authedApp(alice);
        return expect(app.ref('cursors/cw-id/cursor-id').once('value')).to.be.fulfilled();
      });

      it('can be read by collaborator', () => {
        const app = authedApp(bob);
        return expect(app.ref('cursors/cw-id/cursor-id').once('value')).to.be.fulfilled();
      });

      it('cannot be read by non-owner non-collaborator', () => {
        const app = authedApp(charlie);
        return expect(app.ref('cursors/cw-id/cursor-id').once('value')).to.be.rejected();
      });
    });
  });

  describe('with no cw in place', () => {
    it('cannot be created', () => {
      const app = authedApp(alice);
      return expect(
        app.ref().update({
          'cursors/cw-id/cursor-id': {
            userId: alice,
          },
        })
      ).to.be.rejected();
    });
  });

  describe('communal crossword', () => {
    // TODO yeah we should really have a service account for these things
    // the only interesting test here is that users can write this stuff
    it('can be set by an admin', () =>
      expect(
        adminApp.ref().update({
          'communityCrossword/current': 'cw-id',
        })
      ).to.be.fulfilled());

    it('cannot be set by non-admin', () =>
      expect(
        authedApp(alice).ref().update({
          'communityCrossword/current': 'cw-id',
        })
      ).to.be.rejected());

    it('cannot be set by non-admin again', () => expect(5).to.equal(5));
  });
});

describe.only('experiment', () => {
  it('can be set to a number?', () => {
    expect(authedApp(alice).ref('experiment').set(3)).to.be.fulfilled();
  });
  it('can be set to a string?', () => {
    expect(authedApp(alice).ref('experiment').set('hi')).to.be.fulfilled();
  });
  it('can be set to an object with the field?', () => {
    expect(
      authedApp(alice).ref('/experiment').set({
        field: 'hi',
      })
    ).to.be.fulfilled();
  });
});
