// can we get these things to work off a pre-poulated cache for ssr?
// maybe default or effect can read from a global cache

export function coerceToObject<T>(
  value: Record<string, T> | T[]
): Record<string, T> {
  if (Array.isArray(value)) {
    const result: Record<string, T> = {};
    value.forEach((entry, index) => {
      if (entry) {
        result[index] = entry;
      }
    });
    return result;
  }
  return value;
}
