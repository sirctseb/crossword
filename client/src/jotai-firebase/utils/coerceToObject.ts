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
