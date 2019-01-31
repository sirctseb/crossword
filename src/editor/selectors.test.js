import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import { test } from './selectors';

chai.use(dirtyChai);

const makeCrossword = board => ({
    rows: board.length,
    boxes: board.map(row => row.split('').map(entry => ({ blocked: entry === 'b', content: entry }))),
});

describe('selectors', () => {
    describe('firstBoxAddress', () => {
        describe('across', () => {
            it('moves to column 0', () => {
                const crossword = makeCrossword(['---', '---', '---']);
                const subject = test.firstBoxAddress(crossword, 1, 1, 'across');
                expect(subject.row).to.equal(1);
                expect(subject.column).to.equal(0);
            });
        });
        describe('down', () => {
            it('moves to row 0', () => {
                const crossword = makeCrossword(['---', '---', '---']);
                const subject = test.firstBoxAddress(crossword, 1, 1, 'down');
                expect(subject.row).to.equal(0);
                expect(subject.column).to.equal(1);
            });
        });
    });

    describe('notBlocked', () => {
        it('returns true with explicit false value', () => {
            expect(test.notBlocked({ boxes: { 0: { 0: { blocked: false } } } }, 0, 0)).to.be.true();
        });
        it('returns true with absent value', () => {
            expect(test.notBlocked({ boxes: { 0: { 0: { content: 'a' } } } }, 0, 0)).to.be.true();
        });
        it('returns true with no box', () => {
            expect(test.notBlocked({}, 0, 0)).to.be.true();
        });
        it('returns false with true value', () => {
            expect(test.notBlocked({ boxes: { 0: { 0: { blocked: true } } } }, 0, 0)).to.be.false();
        });
    });

    describe('isAt', () => {
        it('returns true with same row and column', () => {
            const row = 0;
            const column = 0;
            expect(test.isAt({ row, column }, row, column)).to.be.true();
        });
        it('returns false with different row', () => {
            const row = 0;
            const column = 0;
            expect(test.isAt({ row, column }, row + 1, column)).to.be.false();
        });
        it('returns false with different column', () => {
            const row = 0;
            const column = 0;
            expect(test.isAt({ row, column }, row, column + 1)).to.be.false();
        });
    });

    describe('boxAt', () => {
        it('returns the object at the address', () => {
            const row = 4;
            const column = 8;
            const payload = 'payload';
            const crossword = { boxes: { [row]: { [column]: { payload } } } };
            expect(test.boxAt(crossword, row, column).payload).to.equal(payload);
        });

        it('returns a blank bbox when there is none', () => {
            const subject = test.boxAt({}, 0, 0);
            expect(subject).to.be.a('object');
        });
    });

    describe('candidateAt', () => {
        it('creates an object with row, column, and the box', () => {
            const row = 4;
            const column = 8;
            const payload = 'payload';
            const crossword = { boxes: { [row]: { [column]: { payload } } } };

            const subject = test.candidateAt(crossword, row, column);
            expect(subject.box.payload).to.equal(payload);
            expect(subject.row).to.equal(row);
            expect(subject.column).to.equal(column);
        });

        it('supplies a blank box when there is none', () => {
            const crossword = { rows: 1 };
            const subject = test.candidateAt(crossword, 0, 0);
            expect(subject.box).to.be.a('object');
        });
    });

    describe('cycleInAnswerDown', () => {
        const crossword = {
            rows: 4,
            boxes: {
                0: {
                    1: {
                        blocked: true,
                    }
                },
                1: {
                    0: {
                        payload: 'payload',
                    },
                },
                2: {
                    0: {
                        blocked: true,
                    },
                },
            },
        };
        it('returns a candidate', () => {
            const subject = test.cycleInAnswerDown(crossword, 0, 0);
            expect(subject.box.payload).to.equal('payload');
            expect(subject.row).to.be.a('number');
            expect(subject.column).to.be.a('number');
        });
        it('increments the row', () => {
            const subject = test.cycleInAnswerDown(crossword, 0, 0);
            expect(subject.row).to.equal(1);
        });
        it('does not change the column', () => {
            const subject = test.cycleInAnswerDown(crossword, 0, 0);
            expect(subject.column).to.equal(0);
        });
        it('loops when it hits a block', () => {
            const subject = test.cycleInAnswerDown(crossword, 1, 0);
            expect(subject.row).to.equal(0);
        });
        it('loops when it hits the end', () => {
            const subject = test.cycleInAnswerDown(crossword, 3, 2);
            expect(subject.row).to.equal(0);
        });
        it('resets after the preceding block', () => {
            const subject = test.cycleInAnswerDown(crossword, 3, 1);
            expect(subject.row).to.equal(1);
        });
    });

    describe('cycleInAnswerAcross', () => {
        const crossword = {
            rows: 4,
            boxes: {
                0: {
                    1: {
                        payload: 'payload',
                    },
                    2: {
                        blocked: true,
                    },
                },
                1: {
                    0: {
                        blocked: true,
                    },
                },
            }
        }
        it('returns a candidate', () => {
            const subject = test.cycleInAnswerAcross(crossword, 0, 0);
            expect(subject.box.payload).to.equal('payload');
            expect(subject.row).to.be.a('number');
            expect(subject.column).to.be.a('number');
        });
        it('increments the row', () => {
            const subject = test.cycleInAnswerAcross(crossword, 0, 0);
            expect(subject.column).to.equal(1);
        });
        it('does not change the column', () => {
            const subject = test.cycleInAnswerAcross(crossword, 0, 0);
            expect(subject.row).to.equal(0);
        });
        it('loops when it hits a block', () => {
            const subject = test.cycleInAnswerAcross(crossword, 0, 1);
            expect(subject.column).to.equal(0);
        });
        it('loops when it hits the end', () => {
            const subject = test.cycleInAnswerAcross(crossword, 2, 3);
            expect(subject.column).to.equal(0);
        });
        it('resets after the preceding block', () => {
            const subject = test.cycleInAnswerAcross(crossword, 1, 3);
            expect(subject.column).to.equal(1);
        });
    });

    describe('cycleInAnswer', () => {
        const crossword = { rows: 2 };
        it('increments row given down', () => {
            const subject = test.cycleInAnswer(crossword, 0, 0, 'down');
            expect(subject.row).to.equal(1);
            expect(subject.column).to.equal(0);
        });

        it('increments column given across', () => {
            const subject = test.cycleInAnswer(crossword, 0, 0, 'across');
            expect(subject.row).to.equal(0);
            expect(subject.column).to.equal(1);
        });
    });

    describe('findInCycle', () => {
        const crossword = {
            rows: 3,
            boxes: {
                0: { 1: { flag: true } },
            },
        };
        it('finds when it is after the input', () => {
            const subject = test.findInCycle(crossword, 0, 0, 'across', candidate => candidate.box.flag);
            expect(subject.column).to.equal(1);
        });
        it('finds when it is before the input', () => {
            const subject = test.findInCycle(crossword, 0, 2, 'across', candidate => candidate.box.flag);
            expect(subject.column).to.equal(1);
        });
    });

    const isBang = candidate => candidate.box.content === '!';

    describe('makeCrossword', () => {
        it('generates a crossword', () => {
            const subject = makeCrossword([
                'b!-',
                '---',
                '---',
            ]);

            expect(subject.rows).to.equal(3);
            expect(subject.boxes[0][0].blocked).to.equal(true);
            expect(subject.boxes[0][1].content).to.equal('!');
        });
    });

    describe('findNext', () => {
        describe('down', () => {
            it('advances to the next column', () => {
                const crossword = makeCrossword([
                    '-!-',
                    '---',
                    '---',
                ]);
                const addresses = test.getClueAddresses.resultFunc(crossword).down;

                const subject = test.findNext(crossword, 0, 0, 'down', addresses, isBang);
                expect(subject.row).to.equal(0);
                expect(subject.column).to.equal(1);
            });

            it('advances past the first row of answers to one that starts lower', () => {
                const crossword = makeCrossword([
                    '-b-',
                    '-!-',
                    '---',
                ]);
                const addresses = test.getClueAddresses.resultFunc(crossword).down;

                const subject = test.findNext(crossword, 0, 0, 'down', addresses, isBang);
                expect(subject.row).to.equal(1);
                expect(subject.column).to.equal(1);
            });

            it('wraps around to an earlier answer', () => {
                const crossword = makeCrossword([
                    '!--',
                    '---',
                    '---',
                ]);
                const addresses = test.getClueAddresses.resultFunc(crossword).down;

                const subject = test.findNext(crossword, 0, 2, 'down', addresses, isBang);
                expect(subject.row).to.equal(0);
                expect(subject.column).to.equal(0);
            });
        });

        describe('across', () => {
            it('advances to the next row', () => {
                const crossword = makeCrossword([
                    '---',
                    '!--',
                    '---',
                ]);
                const addresses = test.getClueAddresses.resultFunc(crossword).across;

                const subject = test.findNext(crossword, 0, 1, 'across', addresses, isBang);
                expect(subject.row).to.equal(1);
                expect(subject.column).to.equal(0);
            });

            it('advances past the first row of answers to one that starts after', () => {
                const crossword = makeCrossword([
                    '---',
                    'b!-',
                    '---',
                ]);
                const addresses = test.getClueAddresses.resultFunc(crossword).across;

                const subject = test.findNext(crossword, 0, 0, 'across', addresses, isBang);
                expect(subject.row).to.equal(1);
                expect(subject.column).to.equal(1);
            });

            it('wraps around to an earlier answer', () => {
                const crossword = makeCrossword([
                    '!--',
                    '---',
                    '---',
                ]);
                const addresses = test.getClueAddresses.resultFunc(crossword).across;

                const subject = test.findNext(crossword, 0, 2, 'across', addresses, isBang);
                expect(subject.row).to.equal(0);
                expect(subject.column).to.equal(0);
            });
        });
    });
});
