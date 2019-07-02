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

describe('tests test', () => {
    it('works', () => {
        const app = authedApp({ uid: 'anything' });
        const result = app.ref('secret').once('value');
        return expect(result).to.be.rejected();
    });
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
