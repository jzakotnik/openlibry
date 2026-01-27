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
