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
let testEnv: RulesTestEnvironment;

import { ref, type Database, update, get } from "firebase/database";

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

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    database: { rules, host: "localhost", port: 9000 },
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

  // describe("reading", () => {
  //   beforeEach(
  //     async () =>
  //       await testEnv.withSecurityRulesDisabled(async (adminApp) => {
  //         update(ref(adminApp.database()), {
  //           "crosswords/cw-id": {
  //             rows: 15,
  //             symmetric: true,
  //             title: "untitled",
  //           },
  //           [`users/${alice}/crosswords/cw-id`]: {
  //             title: "Untitled",
  //           },
  //           "permissions/cw-id": { owner: alice, collaborators: { bob: true } },
  //         });
  //       })
  //   );

  //   // TODO what's happening here? there is no assertion?
  //   // it("can be read by the owner", async () => expect(authedApp(alice).ref()));
  // });

  describe("collaborators", () => {
    beforeEach(async () => {
      // TODO why doesn't alice add this herself
      await testEnv.withSecurityRulesDisabled(async (adminApp) => {
        return await update(ref(adminApp.database()), {
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
  });

  //     describe("global", () => {
  //       beforeEach(() =>
  //         adminApp.ref().update({
  //           "permissions/cw-id/global": true,
  //         })
  //       );

  //       it("can be edited by non-owner, non-collaborator", () =>
  //         expect(
  //           authedApp(charlie).ref().update({
  //             "crosswords/cw-id/boxes/0/0/content": "a",
  //           })
  //         ).to.be.fulfilled());

  //       it("cannot have invalid data written", () =>
  //         expect(
  //           authedApp(alice).ref().update({
  //             "crosswords/cw-id/invalid": "a",
  //           })
  //         ).to.be.rejected());
  //     });

  //     describe("readonly", () => {
  //       beforeEach(() =>
  //         adminApp.ref().update({
  //           "permissions/cw-id/readonly": true,
  //         })
  //       );

  //       it("can be read by owner", () =>
  //         expect(
  //           authedApp(alice).ref("crosswords/cw-id").once("value")
  //         ).to.be.fulfilled());

  //       it("cannot be read by non-owner, non-collaborator", () =>
  //         expect(
  //           authedApp(charlie).ref("crosswords/cw-id").once("value")
  //         ).to.be.rejected());

  //       describe("when also global", () => {
  //         beforeEach(() =>
  //           adminApp.ref().update({
  //             "permissions/cw-id/global": true,
  //           })
  //         );

  //         it("can be read by non-owner, non-collaborator", () =>
  //           expect(
  //             authedApp(charlie).ref("crosswords/cw-id").once("value")
  //           ).to.be.fulfilled());
  //       });

  //       it("cannot be edited by owner", () =>
  //         expect(
  //           authedApp(alice).ref().update({
  //             "crosswords/cw-id/boxes/0/0/content": "a",
  //           })
  //         ).to.be.rejected());

  //       it("cannot have invalid data written", () =>
  //         expect(
  //           authedApp(alice).ref().update({
  //             "crosswords/cw-id/invalid": "a",
  //           })
  //         ).to.be.rejected());
  //     });
  //   });

  //   ["global", "readonly"].forEach((attribute) => {
  //     describe(`${attribute} editability`, () => {
  //       describe("as an admin", () => {
  //         // TODO would like to assign to an app ref here. does that break parallel tests?
  //         describe("when the crossword exists", () => {
  //           beforeEach(() =>
  //             adminApp.ref().update({
  //               "crosswords/cw-id": {
  //                 rows: 15,
  //                 symmetric: true,
  //                 title: "untitled",
  //               },
  //               [`users/${alice}/crosswords/cw-id`]: {
  //                 title: "Untitled",
  //               },
  //               "permissions/cw-id": { owner: bob },
  //             })
  //           );

  //           it("can be established", () =>
  //             expect(
  //               adminApp.ref().update({
  //                 [`permissions/cw-id/${attribute}`]: true,
  //               })
  //             ).to.be.fulfilled());

  //           // TODO we want this behavior but it looks like admin accounts
  //           // are not subject to the rules. may consider making a service account
  //           // that is subject to rules
  //           // describe('when the crossword does not exist', () => {
  //           //   it('cannot be established', () =>
  //           //     expect(adminApp.ref().update({
  //           //       [`permissions/cw-id/${attribute}`]: true,
  //           //     })).to.be.rejected());
  //           // });
  //         });

  //         describe("as a user when the crossword exists", () => {
  //           beforeEach(() =>
  //             adminApp.ref().update({
  //               "crosswords/cw-id": {
  //                 rows: 15,
  //                 symmetric: true,
  //                 title: "untitled",
  //               },
  //               [`users/${alice}/crosswords/cw-id`]: {
  //                 title: "Untitled",
  //               },
  //               "permissions/cw-id": { owner: bob },
  //             })
  //           );

  //           it("cannot be set", () =>
  //             expect(
  //               authedApp(alice)
  //                 .ref()
  //                 .update({
  //                   [`permissions/cw-id/${attribute}`]: true,
  //                 })
  //             ).to.be.rejected());

  //           describe(`when it is already ${attribute}`, () => {
  //             beforeEach(() =>
  //               adminApp.ref().update({
  //                 [`permissions/cw-id/${attribute}`]: true,
  //               })
  //             );

  //             it("cannot be unset", () =>
  //               expect(
  //                 authedApp(alice)
  //                   .ref()
  //                   .update({
  //                     [`permissions/cw-id/${attribute}`]: false,
  //                   })
  //               ).to.be.rejected());
  //           });
  //         });
  //       });
  //     });
  //   });
  // });

  // describe("cursors", () => {
  //   describe("when they exist", () => {
  //     beforeEach(() =>
  //       adminApp.ref().update({
  //         "crosswords/cw-id": { rows: 15, symmetric: true, title: "untitiled " },
  //         [`users/${alice}/crosswords/cw-id`]: {
  //           title: "Untitled",
  //         },
  //         "cursors/cw-id": {
  //           "cursor-id-alice": {
  //             userId: alice,
  //           },
  //           "cursor-id-bob": {
  //             userId: bob,
  //           },
  //         },
  //         "permissions/cw-id": {
  //           owner: alice,
  //           collaborators: { bob: true },
  //         },
  //       })
  //     );

  //     it("can be read by cw owner", () => {
  //       const app = authedApp(alice);
  //       return expect(
  //         app.ref().child("cursors/cw-id").once("value")
  //       ).to.be.fulfilled();
  //     });

  //     it("can be read by collaborator", () => {
  //       const app = authedApp(bob);
  //       return expect(
  //         app.ref().child("cursors/cw-id").once("value")
  //       ).to.be.fulfilled();
  //     });

  //     it("cannot be read by non-permitted", () => {
  //       const app = authedApp(charlie);
  //       return expect(
  //         app.ref().child("cursors/cw-id").once("value")
  //       ).to.be.rejected();
  //     });
  //   });

  //   describe("with cw in place", () => {
  //     beforeEach(() =>
  //       adminApp.ref().update({
  //         "crosswords/cw-id": { rows: 15, symmetric: true, title: "untitled" },
  //         [`users/${alice}/crosswords/cw-id`]: {
  //           title: "Untitled",
  //         },
  //         "permissions/cw-id": { owner: alice, collaborators: { bob: true } },
  //       })
  //     );

  //     it("can be created", () => {
  //       const app = authedApp(alice);
  //       return expect(
  //         app.ref().update({
  //           "cursors/cw-id/cursor-id": {
  //             userId: alice,
  //           },
  //         })
  //       ).to.be.fulfilled();
  //     });

  //     it("cannot be created under another users id", () => {
  //       const app = authedApp(alice);
  //       return expect(
  //         app.ref().update({
  //           "cursors/cw-id/cursor-id": {
  //             userId: bob,
  //           },
  //         })
  //       ).to.be.rejected();
  //     });

  //     describe("with existing cursor", () => {
  //       beforeEach(() =>
  //         adminApp.ref().update({
  //           "cursors/cw-id/cursor-id": {
  //             userId: alice,
  //             row: 0,
  //             column: 0,
  //           },
  //         })
  //       );

  //       it("cannot be deleted by another user", () => {
  //         const app = authedApp(bob);
  //         return expect(
  //           app.ref("cursors/cw-id/cursor-id").set(null)
  //         ).to.be.rejected();
  //       });

  //       it("can be deleted by owner", () => {
  //         const app = authedApp(alice);
  //         return expect(
  //           app.ref("cursors/cw-id/cursor-id").set(null)
  //         ).to.be.fulfilled();
  //       });

  //       it("can be read by owner", () => {
  //         const app = authedApp(alice);
  //         return expect(
  //           app.ref("cursors/cw-id/cursor-id").once("value")
  //         ).to.be.fulfilled();
  //       });

  //       it("can be read by collaborator", () => {
  //         const app = authedApp(bob);
  //         return expect(
  //           app.ref("cursors/cw-id/cursor-id").once("value")
  //         ).to.be.fulfilled();
  //       });

  //       it("cannot be read by non-owner non-collaborator", () => {
  //         const app = authedApp(charlie);
  //         return expect(
  //           app.ref("cursors/cw-id/cursor-id").once("value")
  //         ).to.be.rejected();
  //       });
  //     });
  //   });

  //   describe("with no cw in place", () => {
  //     it("cannot be created", () => {
  //       const app = authedApp(alice);
  //       return expect(
  //         app.ref().update({
  //           "cursors/cw-id/cursor-id": {
  //             userId: alice,
  //           },
  //         })
  //       ).to.be.rejected();
  //     });
  //   });

  //   describe("communal crossword", () => {
  //     // TODO yeah we should really have a service account for these things
  //     // the only interesting test here is that users can write this stuff
  //     it("can be set by an admin", () =>
  //       expect(
  //         adminApp.ref().update({
  //           "communityCrossword/current": "cw-id",
  //         })
  //       ).to.be.fulfilled());

  //     it("cannot be set by non-admin", () =>
  //       expect(
  //         authedApp(alice).ref().update({
  //           "communityCrossword/current": "cw-id",
  //         })
  //       ).to.be.rejected());

  //     it("cannot be set by non-admin again", () => expect(5).to.equal(5));
  //   });
});
