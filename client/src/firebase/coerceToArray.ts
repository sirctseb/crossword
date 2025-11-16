import type { FirebaseArray } from "../firebase/types";

export function fillBlanksWithValue<T>(
  value: T[],
  defaultValue: T,
  length: number
): T[] {
  const result = [...value];
  for (let i = 0; i < length; i++) {
    if (result[i] === undefined) {
      result[i] = defaultValue;
    }
  }
  return result;
}

/**
 * Take an arbitrary FirebaseArray value and return an array form in case
 * it is an object with number keys instead of a native array.
 *
 * If a defaultValue and length are provided, any absent values in the resulting
 * array (array access returns undefined), will be assigned the defaultValue by
 * reference.
 */

export function coerceToArray<T>(value: FirebaseArray<T>): T[];
export function coerceToArray<T>(
  value: FirebaseArray<T>,
  defaultValue: T,
  length: number
): T[];
export function coerceToArray<T>(
  value: Record<string, T> | T[],
  defaultValue?: T,
  length?: number
): T[] {
  if (!Array.isArray(value)) {
    const result: T[] = [];
    Object.entries(value).forEach(([key, valueAtKey]) => {
      const index = Number(key);
      if (isNaN(index)) {
        throw new Error(`Cannot coerce to array, key (${key}) is not a number`);
      }
      result[index] = valueAtKey;
    });

    if (defaultValue !== undefined && length !== undefined) {
      return fillBlanksWithValue(result, defaultValue, length);
    }
    return result;
  }
  if (defaultValue !== undefined && length !== undefined) {
    return fillBlanksWithValue(value, defaultValue, length);
  }
  return value;
}
