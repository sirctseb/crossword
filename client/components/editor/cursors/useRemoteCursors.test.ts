import { test } from './useRemoteCursors';

describe('reduceCursors', () => {
  it('returns an empty map with no elements', () => {
    expect(test.reduceCursors({})).toEqual({});
  });

  it('creates a map from [row][column] to an array with an element with a row and a column', () => {
    const cursors = {
      cursor1: {
        row: 0,
        column: 0,
        testPayload: '00',
        userId: 'userid-1',
      },
      cursor2: {
        row: 1,
        column: 1,
        testPayload: '11',
        userId: 'userid-2',
      },
    };

    expect(test.reduceCursors(cursors)).toEqual({
      0: { 0: [{ row: 0, column: 0, testPayload: '00', userId: 'userid-1', id: 'cursor1' }] },
      1: { 1: [{ row: 1, column: 1, testPayload: '11', userId: 'userid-2', id: 'cursor2' }] },
    });
  });

  it('puts entries with the same row and column into the same array', () => {
    const cursors = {
      cursor1: {
        row: 0,
        column: 0,
        testPayload: '00',
        userId: 'userid-1',
      },
      cursor2: {
        row: 0,
        column: 0,
        testPayload: 'zerozero',
        userId: 'userid-2',
      },
    };

    expect(test.reduceCursors(cursors)).toEqual({
      0: {
        0: [
          {
            row: 0,
            column: 0,
            testPayload: '00',
            userId: 'userid-1',
            id: 'cursor1',
          },
          {
            row: 0,
            column: 0,
            testPayload: 'zerozero',
            userId: 'userid-2',
            id: 'cursor2',
          },
        ],
      },
    });
  });
  it('omits cursors without a row or column', () => {
    const cursors = {
      cursor1: {
        row: undefined,
        column: 0,
        testPayload: '00',
        userId: 'userid-1',
      },
    };

    expect(test.reduceCursors(cursors)).toEqual({});
  });
});
