import admin from "firebase-admin";
import { afterAll } from "@jest/globals";
import test from "./testConfig";

afterAll(async () => {
  test.cleanup();
  await Promise.all(admin.apps.map((app) => app?.delete()));
});
