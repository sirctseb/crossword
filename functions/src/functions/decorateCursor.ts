import { onValueCreated } from "firebase-functions/v2/database";
import * as logger from "firebase-functions/logger";
import { admin } from "../utils/firebase";
import { colors } from "../data/constants";
import { Cursor } from "../types";

// TODO 1.3k out of 2M invocations over the past couple days of just me developing
// we could cut this down by leaving the cursors in place and marking them inactive?
// then come by and reap them once in a while?

export const decorateCursor = onValueCreated(
  "/cursors/{crosswordId}/{cursorId}",
  ({ data: snapshot }) => {
    return snapshot.ref.parent
      ?.once("value")
      .then((snap) => snap.val())
      .then((cursors: Record<string, Cursor>) => Object.values(cursors || {}))
      .then((values) => values.map((value) => value.color))
      .then(
        (usedColors) =>
          colors.find((color) => !usedColors.includes(color)) ||
          colors[Math.floor(Math.random() * colors.length)]
      )
      .then((color) => {
        logger.info("decorating cursor", { color, id: snapshot.key });

        const userId = (snapshot.val() as Cursor)?.userId;

        // TODO handle case where userId doesn't produce a user with getUser
        return admin
          .auth()
          .getUser(userId)
          .then((user) => {
            logger.info("got user details, beginning transaction");
            // we run this in a transaction to avoid a race condition where
            // we end up decorating a cursor that has already been deleted
            return snapshot.ref.transaction((value) => {
              logger.info("running transaction", { value });
              if (value) {
                const { displayName, photoURL } = user;
                const newValue = {
                  ...value,
                  displayName,
                  photoURL,
                  color,
                };
                logger.debug("value exists, returning", { newValue });
                return newValue;
              } else {
                logger.debug("value does not exist, returning existing value");
                return value;
              }
            });
          });
      });
  }
);
