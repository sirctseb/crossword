import { coerceToArray } from "./coerceToArray";
import type { FirebaseArray } from "../firebase/types";

// alternative approach would be to have an access utility like get
// to gracefully degrade to null / default value on value absence. lib could
// provide that also. we may have to revisit this if these selectors turn
// out to be slow

export const coerceMatrixToArray = <T>(
  matrix: FirebaseArray<FirebaseArray<T>>,
  defaultValue: T,
  rows: number,
  columns: number
): T[][] => {
  const outer = coerceToArray(matrix, {}, rows);
  return outer.map((inner) => coerceToArray(inner, defaultValue, columns));
};
