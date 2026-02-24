import {
  describe,
  expect,
  it,
  beforeAll,
  beforeEach,
  afterAll,
} from "@jest/globals";
import fs from "fs";

import {
  initializeTestEnvironment,
  type RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";

import { ref, type Database, update, get } from "firebase/database";

// swallow the warns from firebase on permission denied that make test results
// impossible to read
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args.length > 1 && args[1].includes("permission_denied")) {
  } else {
    originalWarn(...args);
  }
};

let testEnv: RulesTestEnvironment;

const alice = "alice";
const bob = "bob";
const charlie = "charlie";

const authedApps: Record<string, Database> = {};
const authedApp = (uid: string) => {
  if (!authedApps[uid]) {
    // @ts-ignore
    authedApps[uid] = testEnv.authenticatedContext(uid).database();
  }

  return authedApps[uid];
};

const rules = fs.readFileSync("rules.json", "utf-8");

const dumpDb = async (): Promise<void> => {
  await testEnv.withSecurityRulesDisabled(async (x) => {
    console.log((await get(ref(x.database()))).toJSON());
  });
};

const withAdminDatabase = (fn: (db: Database) => Promise<void>) => {
  return testEnv.withSecurityRulesDisabled(async (adminApp) => {
    return await fn(adminApp.database() as any as Database);
  });
};

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    database: { rules, host: "127.0.0.1", port: 9000 },
    projectId: "test-crossword",
  });
});

beforeEach(async () => {
  await testEnv.clearDatabase();
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("crossword", () => {
  it("can be created if specifying permissions and owner entry", async () => {
    const db = authedApp(alice);

    return expect(
      assertSucceeds(
        update(ref(db), {
          "crosswords/cw-id": { rows: 15, symmetric: true, title: "untitled" },
          [`users/${alice}/crosswords/cw-id`]: {
            title: "Untitled",
          },
          "permissions/cw-id": { owner: alice },
        })
      )
    ).resolves.not.toThrow();
  });

  it("cannot be created without specifying permissions", async () => {
    const db = authedApp(alice);

    return expect(
      // TODO maybe a jest plugin with matchers for these common cases
      assertFails(
        update(ref(db), {
          "crosswords/cw-id": { rows: 15, symmetric: true, title: "untitled" },
          [`users/${alice}/crosswords/cw-id`]: {
            title: "Untitled",
          },
          // 'permissions/cw-id': { owner: alice },
        })
      )
    ).resolves.toMatchObject({ code: "PERMISSION_DENIED" });
  });

  it("cannot be created without owner entry", () => {
    const db = authedApp(alice);

    return expect(
      update(ref(db), {
        "crosswords/cw-id": { rows: 15, symmetric: true, title: "untitled" },
        // [`users/${alice}/crosswords/cw-id`]: {
        //     title: 'Untitled',
        // },
        "permissions/cw-id": { owner: alice },
      })
    ).rejects.toThrow();
  });

  it("cannot be created under another users id", () => {
    const db = authedApp(alice);

    return expect(
      update(ref(db), {
        "crosswords/cw-id": { rows: 15, symmetric: true, title: "untitled" },
        [`users/${alice}/crosswords/cw-id`]: {
          title: "Untitled",
        },
        "permissions/cw-id": { owner: bob },
      })
    ).rejects.toThrow();
  });

  it("cannot be created without the crossword", () => {
    const db = authedApp(alice);

    return expect(
      update(ref(db), {
        // 'crosswords/cw-id': { rows: 15, symmetric: true, title: 'untitled' },
        [`users/${alice}/crosswords/cw-id`]: {
          title: "Untitled",
        },
        "permissions/cw-id": { owner: alice },
      })
    ).rejects.toThrow();
  });

  describe("reading", () => {
    beforeEach(
      async () =>
        await testEnv.withSecurityRulesDisabled(async (adminApp) => {
          await update(ref(adminApp.database()), {
            "crosswords/cw-id": {
              rows: 15,
              symmetric: true,
              title: "untitled",
            },
            [`users/${alice}/crosswords/cw-id`]: {
              title: "Untitled",
            },
            "permissions/cw-id": { owner: alice, collaborators: { bob: true } },
          });
        })
    );

    it("can be read by the owner", async () =>
      expect(
        assertSucceeds(get(ref(authedApp(alice), "crosswords/cw-id")))
      ).resolves.not.toThrow());
  });

  describe("collaborators", () => {
    beforeEach(async () => {
      // TODO why doesn't alice add this herself
      await withAdminDatabase(async (adminDb) => {
        return await update(ref(adminDb), {
          "crosswords/cw-id": {
            rows: 15,
            symmetric: true,
            title: "untitled",
          },
          [`users/${alice}/crosswords/cw-id`]: {
            title: "Untitled",
          },
          "permissions/cw-id": { owner: alice },
        });
      });
    });

    it("can be added by the owner", async () => {
      const db = authedApp(alice);
      return expect(
        update(ref(db), {
          "permissions/cw-id/collaborators": { [bob]: true },
        })
      ).resolves.not.toThrow();
    });

    it("cannot be added by a non-owner", () => {
      const db = authedApp(bob);
      return expect(
        update(ref(db), {
          "permissions/cw-id/collaborators": { [bob]: true },
        })
      ).rejects.toThrow();
    });
  });

  describe("editing", () => {
    beforeEach(async () =>
      withAdminDatabase(async (adminDb) => {
        await update(ref(adminDb), {
          "crosswords/cw-id": {
            rows: 15,
            symmetric: true,
            title: "untitled",
          },
          [`users/${alice}/crosswords/cw-id`]: {
            title: "Untitled",
          },
          "permissions/cw-id": { owner: alice },
        });
      })
    );

    it("can be edited by the owner", () => {
      const aliceDb = authedApp(alice);
      return expect(
        update(ref(aliceDb), {
          "crosswords/cw-id/boxes/0/0/content": "a",
        })
      ).resolves.not.toThrow();
    });

    it("cannot be edited by a non-owner", () => {
      const bobDb = authedApp(bob);
      return expect(
        update(ref(bobDb), {
          "crosswords/cw-id/boxes/0/0/content": "a",
        })
      ).rejects.toThrow();
    });

    it("cant have invalid data written", () => {
      const aliceDb = authedApp(alice);
      return expect(
        update(ref(aliceDb), {
          "crosswords/cw-id/invalid": "a",
        })
      ).rejects.toThrow();
    });

    describe("collaborators", () => {
      beforeEach(
        async () =>
          await testEnv.withSecurityRulesDisabled(async (adminApp) => {
            await update(ref(adminApp.database()), {
              "permissions/cw-id/collaborators": { [bob]: true },
            });
          })
      );

      it("can be edited by a collaborator", async () => {
        const bobDb = authedApp(bob);
        return expect(
          update(ref(bobDb), {
            "crosswords/cw-id/boxes/0/0/content": "a",
          })
        ).resolves.not.toThrow();
      });

      it("cannot be edited by a non-owner, non-collaborator", () => {
        const charlieDb = authedApp(charlie);

        return expect(
          update(ref(charlieDb), {
            "crosswords/cw-id/boxes/0/0/content": "a",
          })
        ).rejects.toThrow();
      });
    });

    describe("global", () => {
      beforeEach(async () =>
        withAdminDatabase(async (adminDb) => {
          await update(ref(adminDb), {
            "permissions/cw-id/global": true,
          });
        })
      );

      it("can be edited by non-owner, non-collaborator", () =>
        expect(
          assertSucceeds(
            update(ref(authedApp(charlie)), {
              "crosswords/cw-id/boxes/0/0/content": "a",
            })
          )
        ).resolves.not.toThrow());

      it("cannot have invalid data written", () =>
        expect(
          assertFails(
            update(ref(authedApp(alice)), {
              "crosswords/cw-id/invalid": "a",
            })
          )
        ).resolves.toMatchObject({ code: "PERMISSION_DENIED" }));
    });

    describe("readonly", () => {
      beforeEach(() =>
        withAdminDatabase(async (adminDb) => {
          await update(ref(adminDb), {
            "permissions/cw-id/readonly": true,
          });
        })
      );

      it("can be read by owner", () =>
        expect(
          assertSucceeds(get(ref(authedApp(alice), "crosswords/cw-id")))
        ).resolves.not.toThrow());

      it("cannot be read by non-owner, non-collaborator", () =>
        expect(
          assertFails(get(ref(authedApp(charlie), "crosswords/cw-id")))
          // the permission denied error for get operations doesn't have
          // the code property so we just check against the message
        ).resolves.toEqual(new Error("Permission denied")));

      describe("when also global", () => {
        beforeEach(() =>
          withAdminDatabase(async (adminDb) => {
            await update(ref(adminDb), {
              "permissions/cw-id/global": true,
            });
          })
        );

        it("can be read by non-owner, non-collaborator", () =>
          expect(
            assertSucceeds(get(ref(authedApp(charlie), "crosswords/cw-id")))
          ).resolves.not.toThrow());
      });

      it("cannot be edited by owner", () =>
        // TODO, interesting, should the readonly flag be excepted from the write?
        // otherwise there's no coming back from the readonly state
        expect(
          assertFails(
            update(ref(authedApp(alice)), {
              "crosswords/cw-id/boxes/0/0/content": "a",
            })
          )
        ).resolves.toMatchObject({ code: "PERMISSION_DENIED" }));

      it("cannot have invalid data written", () =>
        expect(
          assertFails(
            update(ref(authedApp(alice)), {
              "crosswords/cw-id/invalid": "a",
            })
          )
        ).resolves.toMatchObject({ code: "PERMISSION_DENIED" }));
    });
  });

  ["global", "readonly"].forEach((attribute) => {
    describe(`${attribute} editability`, () => {
      describe("as an admin", () => {
        describe("when the crossword exists", () => {
          beforeEach(() =>
            withAdminDatabase(async (adminDb) => {
              await update(ref(adminDb), {
                "crosswords/cw-id": {
                  rows: 15,
                  symmetric: true,
                  title: "untitled",
                },
                [`users/${alice}/crosswords/cw-id`]: {
                  title: "Untitled",
                },
                "permissions/cw-id": { owner: bob },
              });
            })
          );

          it("can be established", () =>
            expect(
              assertFails(
                update(ref(authedApp(alice)), {
                  [`permissions/cw-id/${attribute}`]: true,
                })
              )
            ).resolves.toThrow("PERMISSION_DENIED"));

          // TODO we want this behavior but it looks like admin accounts
          // are not subject to the rules. may consider making a service account
          // that is subject to rules
          // Update: that's true for the above rules as well, they are not
          // testing anything
          // describe('when the crossword does not exist', () => {
          //   it('cannot be established', () =>
          //     expect(adminApp.ref().update({
          //       [`permissions/cw-id/${attribute}`]: true,
          //     })).to.be.rejected());
          // });
        });

        describe("as a user when the crossword exists", () => {
          beforeEach(() =>
            withAdminDatabase(async (adminDb) => {
              await update(ref(adminDb), {
                "crosswords/cw-id": {
                  rows: 15,
                  symmetric: true,
                  title: "untitled",
                },
                [`users/${alice}/crosswords/cw-id`]: {
                  title: "Untitled",
                },
                "permissions/cw-id": { owner: bob },
              });
            })
          );

          it("cannot be set", () =>
            expect(
              assertFails(
                update(ref(authedApp(alice)), {
                  [`permissions/cw-id/${attribute}`]: true,
                })
              )
            ).resolves.toMatchObject({ code: "PERMISSION_DENIED" }));

          describe(`when it is already ${attribute}`, () => {
            beforeEach(() =>
              withAdminDatabase(async (adminDb) => {
                await update(ref(adminDb), {
                  [`permissions/cw-id/${attribute}`]: true,
                });
              })
            );

            it("cannot be unset", () =>
              expect(
                assertFails(
                  update(ref(authedApp(alice)), {
                    [`permissions/cw-id/${attribute}`]: false,
                  })
                )
              ).resolves.toMatchObject({ code: "PERMISSION_DENIED" }));
          });
        });
      });
    });
  });
});

describe("cursors", () => {
  describe("when they exist", () => {
    beforeEach(() =>
      withAdminDatabase(async (adminDb) => {
        await update(ref(adminDb), {
          "crosswords/cw-id": {
            rows: 15,
            symmetric: true,
            title: "untitiled ",
          },
          [`users/${alice}/crosswords/cw-id`]: {
            title: "Untitled",
          },
          "cursors/cw-id": {
            "cursor-id-alice": {
              userId: alice,
            },
            "cursor-id-bob": {
              userId: bob,
            },
          },
          "permissions/cw-id": {
            owner: alice,
            collaborators: { bob: true },
          },
        });
      })
    );

    it("can be read by cw owner", () => {
      return expect(
        assertSucceeds(get(ref(authedApp(alice), "cursors/cw-id")))
      ).resolves.not.toThrow();
    });

    it("can be read by collaborator", () => {
      return expect(
        assertSucceeds(get(ref(authedApp(bob), "cursors/cw-id")))
      ).resolves.not.toThrow();
    });

    it("cannot be read by non-permitted", () => {
      return expect(
        assertFails(get(ref(authedApp(charlie), "cursors/cw-id")))
      ).resolves.toEqual(new Error("Permission denied"));
    });
  });

  describe("in global cw", () => {
    beforeEach(() =>
      withAdminDatabase(async (adminDb) => {
        await update(ref(adminDb), {
          "crosswords/cw-id": { rows: 15, symmetric: true, title: "untitled" },
          "permissions/cw-id": { global: true },
        });
      })
    );

    it("can be created", () => {
      return expect(
        assertSucceeds(
          update(ref(authedApp(alice)), {
            "cursors/cw-id/cursor-id": {
              userId: alice,
            },
          })
        )
      ).resolves.not.toThrow();
    });

    it("cannot be created under another users id", () => {
      return expect(
        assertFails(
          update(ref(authedApp(alice)), {
            "cursors/cw-id/cursor-id": { userId: bob },
          })
        )
      ).resolves.toMatchObject({ code: "PERMISSION_DENIED" });
    });

    describe("with cursor", () => {
      beforeEach(() =>
        withAdminDatabase(async (adminDb) => {
          await update(ref(adminDb), {
            "cursors/cw-id/cursor-id": {
              userId: alice,
              row: 0,
              column: 0,
            },
          });
        })
      );

      it("can be read by owner", () => {
        return expect(
          assertSucceeds(get(ref(authedApp(alice), "cursors/cw-id/cursor-id")))
        ).resolves.not.toThrow();
      });

      it("can be read by collaborator", () => {
        return expect(
          assertSucceeds(
            get(ref(authedApp(charlie), "cursors/cw-id/cursor-id"))
          )
        ).resolves.not.toThrow();
      });
    });
  });

  describe("with cw in place", () => {
    beforeEach(() =>
      withAdminDatabase(async (adminDb) => {
        await update(ref(adminDb), {
          "crosswords/cw-id": { rows: 15, symmetric: true, title: "untitled" },
          [`users/${alice}/crosswords/cw-id`]: {
            title: "Untitled",
          },
          "permissions/cw-id": { owner: alice, collaborators: { bob: true } },
        });
      })
    );

    it("can be created", () => {
      return expect(
        assertSucceeds(
          update(ref(authedApp(alice)), {
            "cursors/cw-id/cursor-id": {
              userId: alice,
            },
          })
        )
      ).resolves.not.toThrow();
    });

    it("cannot be created under another users id", () => {
      return expect(
        assertFails(
          update(ref(authedApp(alice)), {
            "cursors/cw-id/cursor-id": { userId: bob },
          })
        )
      ).resolves.toMatchObject({ code: "PERMISSION_DENIED" });
    });

    describe("with existing cursor", () => {
      beforeEach(() =>
        withAdminDatabase(async (adminDb) => {
          await update(ref(adminDb), {
            "cursors/cw-id/cursor-id": {
              userId: alice,
              row: 0,
              column: 0,
            },
          });
        })
      );

      it("cannot be deleted by another user", () => {
        return expect(
          assertFails(
            update(ref(authedApp(bob)), {
              "cursors/cw-id/cursor-id": null,
            })
          )
        ).resolves.toMatchObject({ code: "PERMISSION_DENIED" });
      });

      it("can be deleted by owner", () => {
        return expect(
          assertSucceeds(
            update(ref(authedApp(alice)), {
              "cursors/cw-id/cursor-id": null,
            })
          )
        ).resolves.not.toThrow();
      });

      it("can be read by owner", () => {
        return expect(
          assertSucceeds(get(ref(authedApp(alice), "cursors/cw-id/cursor-id")))
        ).resolves.not.toThrow();
      });

      it("can be read by collaborator", () => {
        return expect(
          assertSucceeds(get(ref(authedApp(bob), "cursors/cw-id/cursor-id")))
        ).resolves.not.toThrow();
      });

      it("cannot be read by non-owner non-collaborator", () => {
        return expect(
          assertFails(get(ref(authedApp(charlie), "cursors/cw-id/cursor-id")))
        ).resolves.toEqual(new Error("Permission denied"));
      });
    });
  });

  describe("with no cw in place", () => {
    it("cannot be created", () => {
      return expect(
        assertFails(
          update(ref(authedApp(alice)), {
            "cursors/cw-id/cursor-id": {
              userId: alice,
            },
          })
        )
      ).resolves.toMatchObject({ code: "PERMISSION_DENIED" });
    });
  });
});

describe("communal crossword", () => {
  // TODO yeah we should really have a service account for these things
  // the only interesting test here is that users can write this stuff
  it("can be set by an admin", () =>
    expect(
      withAdminDatabase(async (adminDb) => {
        await update(ref(adminDb), {
          "communityCrossword/current": "cw-id",
        });
      })
    ).resolves.not.toThrow());

  it("cannot be set by non-admin", () =>
    expect(
      assertFails(
        update(ref(authedApp(alice)), {
          "communityCrossword/current": "cw-id",
        })
      )
    ).resolves.toMatchObject({ code: "PERMISSION_DENIED" }));
});

// I love my momma and my papa.
