import { expect } from 'chai';
import { test } from './selectors';

describe('cursor selectors', () => {
  describe('getLocalCursorId', () => {
    it('grabs cursorId from the second argument', () => {
      expect(test.getLocalCursorId({}, { cursorId: 'value' })).to.equal('value');
    });
  });

  describe('getCursorSets', () => {
    it('returns reference to the cursors in firebase state', () => {
      const cursors = {};
      expect(test.getCursorSets({ firebase: { data: { cursors } } })).to.equal(cursors);
    });
  });

  describe('getCursors', () => {
    it('returns reference to the cursors for the crossword id', () => {
      const cursors = {};
      expect(test.getCursors({ firebase: { data: { cursors: { cwid: cursors } } } }, { id: 'cwid' })).to.equal(cursors);
    });
  });

  describe('getRemoteCursors', () => {
    it('returns cursors for the crossword id without the local cursor', () => {
      const cursors = {
        localId: 'a',
        remoteId: 'b',
      };
      expect(
        test.getRemoteCursors(
          { firebase: { data: { cursors: { cwid: cursors } } } },
          { id: 'cwid', cursorId: 'localId' }
        )
      ).to.deep.equal({
        remoteId: 'b',
      });
    });
  });
});
