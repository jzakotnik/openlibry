export default function getMaxId(array: Array<{ id?: number }>): number {
  if (array.length === 0) {
    return 0;
  }

  return array.reduce((max: number, obj) => {
    const id = obj.id ?? 0;
    return id > max ? id : max;
  }, array[0].id ?? 0);
}

export function increaseNumberInString(text: any) {
  return text.replace(/\d+/g, function (match: any) {
    // Convert the matched substring to a number, add 1, and return it
    return parseInt(match, 10) + 1;
  });
}

/**
 * ID generation utilities
 */

/**
 * Generate a unique ID for client-side use (e.g., React keys, temporary IDs)
 * Combines timestamp with random string for uniqueness
 *
 * @returns A unique string ID
 *
 * @example
 * const id = generateId(); // "1699012345678-abc123def"
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Generate a short random ID (without timestamp)
 * Useful for shorter identifiers where collision risk is acceptable
 *
 * @param length - Length of the ID (default: 8)
 * @returns A random string ID
 *
 * @example
 * const id = generateShortId(); // "a1b2c3d4"
 */
export const generateShortId = (length: number = 8): string => {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
};
