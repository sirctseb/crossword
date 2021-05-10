import { Candidate, test } from './derivations';
import { Box, Crossword, Direction } from '../../firebase-recoil/data';

const makeCrossword = (board: string[]): Crossword => ({
  rows: board.length,
  boxes: board.map((row) => row.split('').map((entry) => ({ blocked: entry === 'b', content: entry }))),
  symmetric: true,
});

const cw = (partial?: Partial<Crossword>): Crossword => ({
  rows: 15,
  symmetric: true,
  ...partial,
});

describe('selectors', () => {
  describe('firstBoxAddress', () => {
    describe('across', () => {
      it('moves to column 0', () => {
        const crossword = makeCrossword(['---', '---', '---']);
        const subject = test.firstBoxAddress(crossword, 1, 1, Direction.across);
        expect(subject.row).toBe(1);
        expect(subject.column).toBe(0);
      });
    });
    describe('down', () => {
      it('moves to row 0', () => {
        const crossword = makeCrossword(['---', '---', '---']);
        const subject = test.firstBoxAddress(crossword, 1, 1, Direction.down);
        expect(subject.row).toBe(0);
        expect(subject.column).toBe(1);
      });
    });
  });

  describe('notBlocked', () => {
    it('returns true with explicit false value', () => {
      expect(test.notBlocked(cw({ boxes: [[{ blocked: false }]] }), 0, 0)).toBe(true);
    });
    it('returns true with absent value', () => {
      expect(test.notBlocked(cw({ boxes: [[{ content: 'a' }]] }), 0, 0)).toBe(true);
    });
    it('returns true with no box', () => {
      expect(test.notBlocked(cw({}), 0, 0)).toBe(true);
    });
    it('returns false with true value', () => {
      expect(test.notBlocked(cw({ boxes: [[{ blocked: true }]] }), 0, 0)).toBe(false);
    });
  });

  describe('isAt', () => {
    it('returns true with same row and column', () => {
      const row = 0;
      const column = 0;
      expect(test.isAt({ row, column }, row, column)).toBe(true);
    });
    it('returns false with different row', () => {
      const row = 0;
      const column = 0;
      expect(test.isAt({ row, column }, row + 1, column)).toBe(false);
    });
    it('returns false with different column', () => {
      const row = 0;
      const column = 0;
      expect(test.isAt({ row, column }, row, column + 1)).toBe(false);
    });
  });

  describe('boxAt', () => {
    it('returns the object at the address', () => {
      const row = 4;
      const column = 8;
      const boxes: Box[][] = [];
      boxes[row] = [];
      boxes[row][column] = {};
      const crossword = cw({ boxes });
      expect(test.boxAt(crossword, row, column)).toBe(boxes[row][column]);
    });

    it('returns a blank box when there is none', () => {
      const subject = test.boxAt(cw(), 0, 0);
      expect(subject).toEqual({});
    });
  });

  describe('candidateAt', () => {
    it('creates an object with row, column, and the box', () => {
      const row = 4;
      const column = 8;
      const payload = 'payload';
      const boxes: Box[][] = [];
      boxes[row] = [];
      boxes[row][column] = {};
      const crossword = cw({ boxes });

      const subject = test.candidateAt(crossword, row, column);
      expect(subject.box).toBe(boxes[row][column]);
      expect(subject.row).toBe(row);
      expect(subject.column).toBe(column);
    });

    it('supplies a blank box when there is none', () => {
      const crossword = cw({ rows: 1 });
      const subject = test.candidateAt(crossword, 0, 0);
      expect(subject.box).toEqual({});
    });
  });

  describe('cycleInAnswerDown', () => {
    const target = {};
    const crossword = {
      rows: 4,
      symmetric: true,
      boxes: [[{}, { blocked: true }], [target], [{ blocked: true }]],
    };
    it('returns a candidate', () => {
      const subject = test.cycleInAnswerDown(crossword, 0, 0);
      expect(subject.box).toBe(target);
    });
    it('increments the row', () => {
      const subject = test.cycleInAnswerDown(crossword, 0, 0);
      expect(subject.row).toBe(1);
    });
    it('does not change the column', () => {
      const subject = test.cycleInAnswerDown(crossword, 0, 0);
      expect(subject.column).toBe(0);
    });
    it('loops when it hits a block', () => {
      const subject = test.cycleInAnswerDown(crossword, 1, 0);
      expect(subject.row).toBe(0);
    });
    it('loops when it hits the end', () => {
      const subject = test.cycleInAnswerDown(crossword, 3, 2);
      expect(subject.row).toBe(0);
    });
    it('resets after the preceding block', () => {
      const subject = test.cycleInAnswerDown(crossword, 3, 1);
      expect(subject.row).toBe(1);
    });
  });

  describe('cycleInAnswerAcross', () => {
    const target = {};
    const crossword = {
      rows: 4,
      symmetric: true,
      boxes: [[{}, target, { blocked: true }], [{ blocked: true }]],
    };
    it('returns a candidate', () => {
      const subject = test.cycleInAnswerAcross(crossword, 0, 0);
      expect(subject.box).toBe(target);
    });
    it('increments the row', () => {
      const subject = test.cycleInAnswerAcross(crossword, 0, 0);
      expect(subject.column).toBe(1);
    });
    it('does not change the column', () => {
      const subject = test.cycleInAnswerAcross(crossword, 0, 0);
      expect(subject.row).toBe(0);
    });
    it('loops when it hits a block', () => {
      const subject = test.cycleInAnswerAcross(crossword, 0, 1);
      expect(subject.column).toBe(0);
    });
    it('loops when it hits the end', () => {
      const subject = test.cycleInAnswerAcross(crossword, 2, 3);
      expect(subject.column).toBe(0);
    });
    it('resets after the preceding block', () => {
      const subject = test.cycleInAnswerAcross(crossword, 1, 3);
      expect(subject.column).toBe(1);
    });
  });

  describe('cycleInAnswer', () => {
    const crossword = cw({ rows: 2 });
    it('increments row given down', () => {
      const subject = test.cycleInAnswer(crossword, 0, 0, Direction.down);
      expect(subject.row).toBe(1);
      expect(subject.column).toBe(0);
    });

    it('increments column given across', () => {
      const subject = test.cycleInAnswer(crossword, 0, 0, Direction.across);
      expect(subject.row).toBe(0);
      expect(subject.column).toBe(1);
    });
  });

  describe('findInCycle', () => {
    const target = {};
    const crossword = cw({
      rows: 3,
      boxes: [[{}, target]],
    });
    it('finds when it is after the input', () => {
      const subject = test.findInCycle(crossword, 0, 0, Direction.across, (candidate) => candidate.box === target);
      expect(subject?.column).toBe(1);
    });
    it('finds when it is before the input', () => {
      const subject = test.findInCycle(crossword, 0, 2, Direction.across, (candidate) => candidate.box === target);
      expect(subject?.column).toBe(1);
    });
  });

  const isBang = (candidate: Candidate) => candidate.box.content === '!';

  describe('makeCrossword', () => {
    it('generates a crossword', () => {
      const subject = makeCrossword(['b!-', '---', '---']);

      expect(subject.rows).toBe(3);
      expect(subject.boxes?.[0][0].blocked).toBe(true);
      expect(subject.boxes?.[0][1].content).toBe('!');
    });
  });

  describe('findNext', () => {
    describe('down', () => {
      it('returns null if nothing found', () => {
        const crossword = makeCrossword(['--', '--']);
        const addresses = test.calculateClueAddresses(crossword).down;

        const subject = test.findNext(crossword, 0, 0, Direction.down, addresses, isBang);
        expect(subject).toBe(null);
      });

      it('advances to the next column', () => {
        const crossword = makeCrossword(['-!-', '---', '---']);
        const addresses = test.calculateClueAddresses(crossword).down;

        const subject = test.findNext(crossword, 0, 0, Direction.down, addresses, isBang);
        expect(subject?.row).toBe(0);
        expect(subject?.column).toBe(1);
      });

      it('advances past the first row of answers to one that starts lower', () => {
        const crossword = makeCrossword(['-b-', '-!-', '---']);
        const addresses = test.calculateClueAddresses(crossword).down;

        const subject = test.findNext(crossword, 0, 0, Direction.down, addresses, isBang);
        expect(subject?.row).toBe(1);
        expect(subject?.column).toBe(1);
      });

      it('wraps around to an earlier answer', () => {
        const crossword = makeCrossword(['!--', '---', '---']);
        const addresses = test.calculateClueAddresses(crossword).down;

        const subject = test.findNext(crossword, 0, 2, Direction.down, addresses, isBang);
        expect(subject?.row).toBe(0);
        expect(subject?.column).toBe(0);
      });

      it('returns null given a blocked box', () => {
        const crossword = makeCrossword(['b!-', '---', '---']);
        const addresses = test.calculateClueAddresses(crossword).down;

        const subject = test.findNext(crossword, 0, 0, Direction.down, addresses, isBang);
        expect(subject).toBe(null);
      });
    });

    describe('across', () => {
      it('advances to the next row', () => {
        const crossword = makeCrossword(['---', '!--', '---']);
        const addresses = test.calculateClueAddresses(crossword).across;

        const subject = test.findNext(crossword, 0, 1, Direction.across, addresses, isBang);
        expect(subject?.row).toBe(1);
        expect(subject?.column).toBe(0);
      });

      it('advances past the first row of answers to one that starts after', () => {
        const crossword = makeCrossword(['---', 'b!-', '---']);
        const addresses = test.calculateClueAddresses(crossword).across;

        const subject = test.findNext(crossword, 0, 0, Direction.across, addresses, isBang);
        expect(subject?.row).toBe(1);
        expect(subject?.column).toBe(1);
      });

      it('wraps around to an earlier answer', () => {
        const crossword = makeCrossword(['!--', '---', '---']);
        const addresses = test.calculateClueAddresses(crossword).across;

        const subject = test.findNext(crossword, 0, 2, Direction.across, addresses, isBang);
        expect(subject?.row).toBe(0);
        expect(subject?.column).toBe(0);
      });
    });
  });
});
