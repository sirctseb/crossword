import admin from "firebase-admin";
import { describe, expect, it, beforeAll, beforeEach } from "@jest/globals";

import test, { prepForOnCreate } from "./testConfig";
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

// In a test context, we get the snapshot made with the firebase-functions-test utility,
// and the context we provide. but the value is not actually present in the database,
// so the db is there and you can hit it, and it'll be correct, except for the value
// that is actually in the snapshot. another symptom, biting us in this case,
// is that the value provided by the transaction callback won't have the snapshot created value.
// i guess we've gotten this far because we tend to be asserting about the changes made
// within the function, and if those only depend on the value in the snapshot,
// (and not, e.g., on transaction callback values or db read values at the snapshot ref)
// and you only assert the changes made _within_ the function, then the tests work
// so
// why not just write the snapshot value to the db?
// that might not work if the function is actually deployed to the test environment
// because it will actually run and have the same side effects as these locally running tests
// so options are:
// 1. write the snapshot to the db in advance of executing the functions here, ensuring that the functions
// are not deployed to the test environment.
// 2. mock the db entirely with a basic in-memory value store and a transaction function like in
// the say-that example.

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
    it("adds a user's display name to the cursor", async function () {
      const newCursor = test.database.makeDataSnapshot(
        { userId: aliceAuth.uid, row: 0, column: 0 },
        "/cursors/cw-id/cursor-id"
      );
      await prepForOnCreate(newCursor);
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

    it("adds a user's photo url to the cursor", async () => {
      const newCursor = test.database.makeDataSnapshot(
        { userId: aliceAuth.uid, row: 0, column: 0 },
        "/cursors/cw-id/cursor-id"
      );
      await prepForOnCreate(newCursor);
      return wrapped(newCursor, aliceContext).then(() =>
        admin
          .database()
          .ref("/cursors/cw-id/cursor-id/photoURL")
          .once("value")
          .then((createdSnap) =>
            expect(createdSnap.val()).toBe(aliceAuth.photoUrl)
          )
      );
    });

    describe("colors", () => {
      it("adds a color to the cursor", async () => {
        const newCursor = test.database.makeDataSnapshot(
          { userId: aliceAuth.uid, row: 0, column: 0 },
          "/cursors/cw-id/cursor-id"
        );
        await prepForOnCreate(newCursor);
        return wrapped(newCursor, aliceContext).then(() =>
          admin
            .database()
            .ref("/cursors/cw-id/cursor-id/color")
            .once("value")
            .then((createdSnap) => expect(createdSnap.val()).toBe("FFFF00"))
        );
      });

      it("adds a different color to a second cursor", async () => {
        await admin
          .database()
          .ref("/cursors/cw-id")
          .set({ "cursor-id": { color: "FFFF00" } });

        const newCursor = test.database.makeDataSnapshot(
          { userId: aliceAuth.uid, row: 0, column: 0 },
          "/cursors/cw-id/cursor-id2"
        );
        await prepForOnCreate(newCursor);
        return wrapped(newCursor, aliceContext).then(() =>
          admin
            .database()
            .ref("/cursors/cw-id/cursor-id2/color")
            .once("value")
            .then((createdSnap) => expect(createdSnap.val()).toBe("1CE6FF"))
        );
      });

      it("reuses colors from cursors that have been deleted", async () => {
        await admin
          .database()
          .ref("/cursors/cw-id")
          .set({ "cursor-id": { color: "1CE6FF" } });

        const newCursor = test.database.makeDataSnapshot(
          { userId: aliceAuth.uid, row: 0, column: 0 },
          "/cursors/cw-id/cursor-id3"
        );
        await prepForOnCreate(newCursor);
        return wrapped(newCursor, aliceContext).then(() =>
          admin
            .database()
            .ref("/cursors/cw-id/cursor-id3/color")
            .once("value")
            .then((createdSnap) => expect(createdSnap.val()).toBe("FFFF00"))
        );
      });
    });
  });
});
