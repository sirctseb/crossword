import admin from "firebase-admin";
import { describe, it, expect, beforeEach } from "@jest/globals";
import type { DataSnapshot } from "firebase-admin/database";
import { fn } from "jest-mock";

import "./testTeardown";

import test from "./testConfig";
import { finishCommunalCrossword } from "./index";

const wrapped = test.wrap(finishCommunalCrossword);
const snapVal = (snap: DataSnapshot) => snap.val();

const nonFullCrossword = {
  rows: 2,
  symmetric: true,
  global: true,
  boxes: {
    0: { 0: { content: "A" }, 1: { blocked: true } },
    1: { 0: { content: "A" } },
  },
};

const fullCrossword = {
  rows: 2,
  symmetric: true,
  global: true,
  boxes: {
    0: { 0: { content: "A" }, 1: { content: "A" } },
    1: { 0: { content: "A" }, 1: { blocked: true } },
  },
};

describe("sanity", () => {
  it("works", () => expect(1).toBe(1));
});

describe("finishCommunalCrossword", () => {
  describe("with non-full crossword", () => {
    beforeEach(() =>
      admin
        .database()
        .ref()
        .set({
          crosswords: { "communal-id": nonFullCrossword },
          communalCrossword: { current: "communal-id" },
        })
    );

    it("refuses if the crossword is not full", () =>
      Promise.all([
        expect(
          wrapped({ data: {}, rawRequest: {} as any, acceptsStreaming: false })
        ).rejects.toThrow(),
        expect(
          admin
            .database()
            .ref("communalCrossword/current")
            .once("value")
            .then(snapVal)
        ).resolves.toBe("communal-id"),
        expect(
          admin.database().ref("permissions/communal-id/readonly").once("value")
        ).resolves.not.toBe(true),
      ]));
  });

  describe("with a full crossword", () => {
    beforeEach(() =>
      admin
        .database()
        .ref()
        .set({
          crosswords: { "communal-id": fullCrossword },
          communalCrossword: { current: "communal-id" },
        })
    );

    it("sets the readonly flag on the current puzzle", () =>
      expect(
        wrapped({
          data: {},
          rawRequest: {} as any,
          acceptsStreaming: false,
        })
      )
        .resolves.not.toThrow()
        .then(() =>
          expect(
            admin
              .database()
              .ref("/permissions/communal-id/readonly")
              .once("value")
              .then(snapVal)
          ).resolves.toBe(true)
        ));

    it("adds the current puzzle to the archive", () => {
      const added = fn();
      const crosswordsRef = admin.database().ref("communalCrossword/archive");
      crosswordsRef.on("child_added", added);
      return expect(
        wrapped({
          data: {},
          rawRequest: {} as any,
          acceptsStreaming: false,
        })
      )
        .resolves.not.toThrow()
        .then(() =>
          Promise.all([
            // TODO how to match this value
            // expect(added).toHaveBeenCalledWith()
            // expect(added).to.have.been.calledOnceWith(
            //   sinon.match((snap) => snap.val() === "communal-id")
            // ),
            expect(
              admin
                .database()
                .ref("/communalCrossword/archive")
                .once("value")
                .then(snapVal)
                .then(Object.values)
            ).resolves.toContain("communal-id"),
          ])
        );
    });

    it("creates a new global, non-readonly crossword", () => {
      const added = fn();
      const crosswordsRef = admin.database().ref("crosswords");
      crosswordsRef.on("child_added", added);
      return expect(
        wrapped({
          data: {},
          rawRequest: {} as any,
          acceptsStreaming: false,
        })
      )
        .resolves.not.toThrow()
        .then(() => expect(added).toHaveBeenCalledTimes(2))
        .then(() => crosswordsRef.off());
    });

    it("sets the new puzzle as the current communal puzzle", () => {
      let newKey: string | null;
      const added = fn((data: DataSnapshot) => (newKey = data.key));
      const crosswordsRef = admin.database().ref("crosswords");
      crosswordsRef.on("child_added", added);
      return expect(
        wrapped({
          data: {},
          rawRequest: {} as any,
          acceptsStreaming: false,
        })
      )
        .resolves.not.toThrow()
        .then(() =>
          Promise.all([
            expect(added).toHaveBeenCalledTimes(2),
            expect(
              admin
                .database()
                .ref("communalCrossword/current")
                .once("value")
                .then(snapVal)
            ).resolves.toBe(newKey),
            expect(newKey).not.toBe(null),
            expect(newKey).not.toBe("communal-id"),
            expect(
              admin
                .database()
                .ref(`permissions/${newKey}`)
                .once("value")
                .then(snapVal)
            ).resolves.toMatchObject({ global: true }),
          ])
        )
        .then(() => crosswordsRef.off());
    });
  });
});
