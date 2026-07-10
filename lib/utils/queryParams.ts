/**
 * Helpers for reading Next.js API route query parameters, which arrive as
 * `string | string[] | undefined`.
 */

export function getSingleQueryValue(
  value: string | string[] | undefined,
): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function getPositiveInt(
  value: string | string[] | undefined,
): number | null {
  const parsed = parseInt(getSingleQueryValue(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
