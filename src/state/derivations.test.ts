import { describe, it, expect } from "@jest/globals";

import { test } from "./derivations";
import { type ArrayCrossword, coerceMatrixToArray, type Candidate } from ".";
import type { Box } from "../firebase/types";

describe("tests", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});

const makeCrossword = (shorthand: string[]): ArrayCrossword => ({
  symmetric: false,
  rows: shorthand.length,
  boxes: shorthand.map((row) =>
    row.split("").map((entry) => ({ blocked: entry === "b", content: entry }))
  ),
});

describe("selectors", () => {
  describe("firstBoxAddress", () => {
    describe("across", () => {
      it("moves to column 0", () => {
        const crossword = makeCrossword(["---", "---", "---"]);
        const subject = test.firstBoxAddress(crossword, 1, 1, "across");
        expect(subject.row).toBe(1);
        expect(subject.column).toBe(0);
      });
    });
    describe("down", () => {
      it("moves to row 0", () => {
        const crossword = makeCrossword(["---", "---", "---"]);
        const subject = test.firstBoxAddress(crossword, 1, 1, "down");
        expect(subject.row).toBe(0);
        expect(subject.column).toBe(1);
      });
    });
  });

  describe("notBlocked", () => {
    it("returns true with explicit false value", () => {
      expect(
        test.notBlocked(
          { boxes: [[{ blocked: false }]], rows: 1, symmetric: false },
          0,
          0
        )
      ).toBe(true);
    });
    it("returns true with absent value", () => {
      expect(
        test.notBlocked(
          { boxes: [[{ content: "a" }]], rows: 1, symmetric: false },
          0,
          0
        )
      ).toBe(true);
    });
    it("returns true with no box", () => {
      expect(
        test.notBlocked({ boxes: [[{}]], rows: 1, symmetric: false }, 0, 0)
      ).toBe(true);
    });
    it("returns false with true value", () => {
      test.notBlocked(
        { boxes: [[{ blocked: true }]], rows: 1, symmetric: false },
        0,
        0
      );
    });
  });

  describe("isAt", () => {
    it("returns true with same row and column", () => {
      const row = 0;
      const column = 0;
      expect(test.isAt({ row, column }, row, column)).toBe(true);
    });
    it("returns false with different row", () => {
      const row = 0;
      const column = 0;
      expect(test.isAt({ row, column }, row + 1, column)).toBe(false);
    });
    it("returns false with different column", () => {
      const row = 0;
      const column = 0;
      expect(test.isAt({ row, column }, row, column + 1)).toBe(false);
    });
  });

  describe("boxAt", () => {
    it("returns the object at the address", () => {
      const row = 4;
      const column = 3;
      const payload = "payload";
      const crossword = {
        boxes: coerceMatrixToArray(
          { [row]: { [column]: { payload } as Box } },
          {},
          4,
          4
        ),
        rows: 4,
        symmetric: false,
      };
      expect((test.boxAt(crossword, row, column) as any).payload).toBe(payload);
    });
  });

  describe("candidateAt", () => {
    it("creates an object with row, column, and the box", () => {
      const row = 4;
      const column = 8;
      const payload = "payload";
      const boxes: Box[][] = [];
      boxes[row] = [];
      boxes[row][column] = { payload } as Box;
      const crossword: ArrayCrossword = {
        boxes,
        rows: 8,
        symmetric: false,
      };

      const subject = test.candidateAt(crossword, row, column);
      expect((subject.box as any).payload).toBe(payload);
      expect(subject.row).toBe(row);
      expect(subject.column).toBe(column);
    });
  });

  describe("cycleInAnswerDown", () => {
    const crossword = {
      symmetric: false,
      rows: 4,
      boxes: coerceMatrixToArray<Box>(
        {
          0: {
            1: {
              blocked: true,
            },
          },
          1: {
            0: {
              payload: "payload",
            } as Box,
          },
          2: {
            0: {
              blocked: true,
            },
          },
        },
        {},
        4,
        4
      ),
    };
    it("returns a candidate", () => {
      const subject = test.cycleInAnswerDown(crossword, 0, 0);
      expect((subject.box as any).payload).toBe("payload");
      expect(subject.row).toEqual(expect.any(Number));
      expect(subject.column).toEqual(expect.any(Number));
    });
    it("increments the row", () => {
      const subject = test.cycleInAnswerDown(crossword, 0, 0);
      expect(subject.row).toBe(1);
    });
    it("does not change the column", () => {
      const subject = test.cycleInAnswerDown(crossword, 0, 0);
      expect(subject.column).toBe(0);
    });
    it("loops when it hits a block", () => {
      const subject = test.cycleInAnswerDown(crossword, 1, 0);
      expect(subject.row).toBe(0);
    });
    it("loops when it hits the end", () => {
      const subject = test.cycleInAnswerDown(crossword, 3, 2);
      expect(subject.row).toBe(0);
    });
    it("resets after the preceding block", () => {
      const subject = test.cycleInAnswerDown(crossword, 3, 1);
      expect(subject.row).toBe(1);
    });
  });

  describe("cycleInAnswerAcross", () => {
    const crossword = {
      symmetric: false,
      rows: 4,
      boxes: coerceMatrixToArray<Box>(
        {
          0: {
            1: {
              payload: "payload",
            } as Box,
            2: {
              blocked: true,
            },
          },
          1: {
            0: {
              blocked: true,
            },
          },
        },
        {},
        4,
        4
      ),
    };
    it("returns a candidate", () => {
      const subject = test.cycleInAnswerAcross(crossword, 0, 0);
      expect((subject.box as any).payload).toBe("payload");
      expect(subject.row).toEqual(expect.any(Number));
      expect(subject.column).toEqual(expect.any(Number));
    });
    it("increments the row", () => {
      const subject = test.cycleInAnswerAcross(crossword, 0, 0);
      expect(subject.column).toBe(1);
    });
    it("does not change the column", () => {
      const subject = test.cycleInAnswerAcross(crossword, 0, 0);
      expect(subject.row).toBe(0);
    });
    it("loops when it hits a block", () => {
      const subject = test.cycleInAnswerAcross(crossword, 0, 1);
      expect(subject.column).toBe(0);
    });
    it("loops when it hits the end", () => {
      const subject = test.cycleInAnswerAcross(crossword, 2, 3);
      expect(subject.column).toBe(0);
    });
    it("resets after the preceding block", () => {
      const subject = test.cycleInAnswerAcross(crossword, 1, 3);
      expect(subject.column).toBe(1);
    });
  });

  describe("cycleInAnswer", () => {
    const crossword = makeCrossword(["--", "--"]);
    it("increments row given down", () => {
      const subject = test.cycleInAnswer(crossword, 0, 0, "down");
      expect(subject.row).toBe(1);
      expect(subject.column).toBe(0);
    });

    it("increments column given across", () => {
      const subject = test.cycleInAnswer(crossword, 0, 0, "across");
      expect(subject.row).toBe(0);
      expect(subject.column).toBe(1);
    });
  });

  describe("findInCycle", () => {
    const crossword = {
      symmetric: false,
      rows: 3,
      boxes: coerceMatrixToArray(
        {
          0: { 1: { flag: true } as Box },
        },
        {},
        3,
        3
      ),
    };
    it("finds when it is after the input", () => {
      const subject = test.findInCycle(
        crossword,
        0,
        0,
        "across",
        (candidate) => (candidate.box as any).flag
      );
      expect(subject?.column).toBe(1);
    });
    it("finds when it is before the input", () => {
      const subject = test.findInCycle(
        crossword,
        0,
        2,
        "across",
        (candidate) => (candidate.box as any).flag
      );
      expect(subject?.column).toBe(1);
    });
  });

  const isBang = (candidate: Candidate) => candidate.box.content === "!";

  describe("makeCrossword", () => {
    it("generates a crossword", () => {
      // prettier-ignore
      const subject = makeCrossword([
        'b!-',
        '---',
        '---',
      ]);

      expect(subject.rows).toBe(3);
      expect(subject.boxes[0][0].blocked).toBe(true);
      expect(subject.boxes[0][1].content).toBe("!");
    });
  });

  describe("findNext", () => {
    describe("down", () => {
      it("returns null if nothing found", () => {
        // prettier-ignore
        const crossword = makeCrossword([
          '--',
          '--',
        ]);
        const addresses = test.deriveClueAddresses(crossword).down;

        const subject = test.findNext(
          crossword,
          0,
          0,
          "down",
          addresses,
          isBang
        );
        expect(subject).toBe(null);
      });

      it("advances to the next column", () => {
        // prettier-ignore
        const crossword = makeCrossword([
          '-!-',
          '---',
          '---',
        ]);
        const addresses = test.deriveClueAddresses(crossword).down;

        const subject = test.findNext(
          crossword,
          0,
          0,
          "down",
          addresses,
          isBang
        );
        expect(subject?.row).toBe(0);
        expect(subject?.column).toBe(1);
      });

      it("advances past the first row of answers to one that starts lower", () => {
        // prettier-ignore
        const crossword = makeCrossword([
          '-b-',
          '-!-',
          '---',
        ]);
        const addresses = test.deriveClueAddresses(crossword).down;

        const subject = test.findNext(
          crossword,
          0,
          0,
          "down",
          addresses,
          isBang
        );
        expect(subject?.row).toBe(1);
        expect(subject?.column).toBe(1);
      });

      it("wraps around to an earlier answer", () => {
        // prettier-ignore
        const crossword = makeCrossword([
          '!--',
          '---',
          '---',
        ]);
        const addresses = test.deriveClueAddresses(crossword).down;

        const subject = test.findNext(
          crossword,
          0,
          2,
          "down",
          addresses,
          isBang
        );
        expect(subject?.row).toBe(0);
        expect(subject?.column).toBe(0);
      });

      it("returns null given a blocked box", () => {
        // prettier-ignore
        const crossword = makeCrossword([
          'b!-',
          '---',
          '---',
        ]);
        const addresses = test.deriveClueAddresses(crossword).down;

        const subject = test.findNext(
          crossword,
          0,
          0,
          "down",
          addresses,
          isBang
        );
        expect(subject).toBe(null);
      });
    });

    describe("across", () => {
      it("advances to the next row", () => {
        // prettier-ignore
        const crossword = makeCrossword([
          '---',
          '!--',
          '---',
        ]);
        const addresses = test.deriveClueAddresses(crossword).across;

        const subject = test.findNext(
          crossword,
          0,
          1,
          "across",
          addresses,
          isBang
        );
        expect(subject?.row).toBe(1);
        expect(subject?.column).toBe(0);
      });

      it("advances past the first row of answers to one that starts after", () => {
        // prettier-ignore
        const crossword = makeCrossword([
          '---',
          'b!-',
          '---',
        ]);
        const addresses = test.deriveClueAddresses(crossword).across;

        const subject = test.findNext(
          crossword,
          0,
          0,
          "across",
          addresses,
          isBang
        );
        expect(subject?.row).toBe(1);
        expect(subject?.column).toBe(1);
      });

      it("wraps around to an earlier answer", () => {
        // prettier-ignore
        const crossword = makeCrossword([
          '!--',
          '---',
          '---',
        ]);
        const addresses = test.deriveClueAddresses(crossword).across;

        const subject = test.findNext(
          crossword,
          0,
          2,
          "across",
          addresses,
          isBang
        );
        expect(subject?.row).toBe(0);
        expect(subject?.column).toBe(0);
      });
    });
  });
});
