import { onCall } from "firebase-functions/v2/https";
import { admin, snapVal } from "../utils/firebase";

// TODO need to return a status here
export const finishCommunalCrossword = onCall(() =>
  admin
    .database()
    .ref("/communalCrossword/current")
    .once("value")
    .then(snapVal)
    .then((currentId) =>
      admin
        .database()
        .ref("/crosswords")
        .child(currentId)
        .once("value")
        .then((crosswordSnap) => {
          const crossword = crosswordSnap.val();
          const { rows } = crossword;
          const range = [...Array(rows).keys()];
          if (
            range.every((row) =>
              range.every((column) => {
                const { content, blocked } =
                  crossword.boxes?.[row]?.[column] || {};
                return content || blocked;
              })
            )
          ) {
            const ref = admin.database().ref();
            const newCrosswordId = ref.push().key;
            const newArchiveEntry = ref.push().key;
            return ref.update({
              [`/permissions/${currentId}/readonly`]: true,
              [`/communalCrossword/archive/${newArchiveEntry}`]: currentId,
              "/communalCrossword/current": newCrosswordId,
              [`/crosswords/${newCrosswordId}`]: {
                rows: 15,
                symmetric: true,
                title: `Puzzle - ${Date()}`,
              },
              [`/permissions/${newCrosswordId}/global`]: true,
            });
          }
          throw new Error("Crossword not complete");
        })
    )
);
