import admin from "firebase-admin";
import { describe, expect, it, beforeAll, beforeEach } from "@jest/globals";

import test from "./testConfig";
import { decorateCursor } from "./index";

import "./testTeardown";

const wrapped = test.wrap(decorateCursor);
const aliceAuth = {
  uid: "alice",
  displayName: "Alice Inwonderland",
  photoUrl: "https://example.com",
};
const aliceContext = {
  auth: aliceAuth,
};

describe("Cursor Decoration", () => {
  // ensure the alice user exists
  // TODO update every time in case values change?
  beforeAll(() =>
    admin
      .auth()
      .createUser(aliceAuth)
      .catch(() => null)
  );

  beforeEach(async () => {
    await admin.database().ref().remove();
  });

  describe("decorateCursor", () => {
    it("adds a user's display name to the cursor", () => {
      const newCursor = test.database.makeDataSnapshot(
        { userId: aliceAuth.uid, row: 0, column: 0 },
        "/cursors/cw-id/cursor-id"
      );
      return wrapped(newCursor, aliceContext).then(() =>
        admin
          .database()
          .ref("/cursors/cw-id/cursor-id/displayName")
          .once("value")
          .then((createdSnap) => {
            return expect(createdSnap.val()).toBe(aliceAuth.displayName);
          })
      );
    });

    it("adds a user's photo url to the cursor", () => {
      const newCursor = test.database.makeDataSnapshot(
        { userId: aliceAuth.uid, row: 0, column: 0 },
        "/cursors/cw-id/cursor-id"
      );
      return wrapped(newCursor, aliceContext).then(() =>
        admin
          .database()
          .ref("/cursors/cw-id/cursor-id/photoUrl")
          .once("value")
          .then((createdSnap) =>
            expect(createdSnap.val()).toBe(aliceAuth.photoUrl)
          )
      );
    });

    describe("colors", () => {
      it("adds a color to the cursor", () => {
        const newCursor = test.database.makeDataSnapshot(
          { userId: aliceAuth.uid, row: 0, column: 0 },
          "/cursors/cw-id/cursor-id"
        );
        return wrapped(newCursor, aliceContext).then(() =>
          admin
            .database()
            .ref("/cursors/cw-id/cursor-id/color")
            .once("value")
            .then((createdSnap) => expect(createdSnap.val()).toBe("FFFF00"))
        );
      });

      it("adds a different color to a second cursor", () =>
        admin
          .database()
          .ref("/cursors/cw-id")
          .set({ "cursor-id": { color: "FFFF00" } })
          .then(() => {
            const newCursor = test.database.makeDataSnapshot(
              { userId: aliceAuth.uid, row: 0, column: 0 },
              "/cursors/cw-id/cursor-id2"
            );
            return wrapped(newCursor, aliceContext).then(() =>
              admin
                .database()
                .ref("/cursors/cw-id/cursor-id2/color")
                .once("value")
                .then((createdSnap) => expect(createdSnap.val()).toBe("1CE6FF"))
            );
          }));

      it("reuses colors from cursors that have been deleted", () =>
        admin
          .database()
          .ref("/cursors/cw-id")
          .set({ "cursor-id": { color: "1CE6FF" } })
          .then(() => {
            const newCursor = test.database.makeDataSnapshot(
              { userId: aliceAuth.uid, row: 0, column: 0 },
              "/cursors/cw-id/cursor-id3"
            );
            return wrapped(newCursor, aliceContext).then(() =>
              admin
                .database()
                .ref("/cursors/cw-id/cursor-id3/color")
                .once("value")
                .then((createdSnap) => expect(createdSnap.val()).toBe("FFFF00"))
            );
          }));
    });
  });
});
