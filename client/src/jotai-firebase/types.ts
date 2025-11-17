// Type for object with arbitrary keys, which  may be numbers,
// which in some cases will be returned from the firebase sdk as an array
export type FirebaseArray<K extends string, T> = Record<K, T> | T[];
export type FirebaseValue = boolean | string | number | Object | null;
export type FirebaseReadValue<T extends FirebaseValue = FirebaseValue> =
  | T
  | undefined;
