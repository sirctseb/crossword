import { onCall } from "firebase-functions/v2/https";
import { words } from "../data/constants";

export const matchingAnswers = onCall(({ data: { regex } }) =>
  words.filter((word) => word.match(regex))
);
