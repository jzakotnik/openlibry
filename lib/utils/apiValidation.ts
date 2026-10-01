/**
 * Small, dependency-free validators for API route inputs.
 *
 * `parseInt("12abc")` returns 12 and `parseInt("abc")` returns NaN, which then
 * flows into Prisma or the filesystem. These helpers accept only plain
 * non-negative decimal integers and return `null` for everything else, so
 * routes can answer with a consistent 400 instead of a 500 or a hung request.
 */

const INTEGER_PATTERN = /^\d+$/;

/** Parse a query/path value (string or first of string[]) as a safe integer >= 0. */
export function parseIntegerParam(value: unknown): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string" || !INTEGER_PATTERN.test(raw)) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) ? n : null;
}

/** Like parseIntegerParam, but also rejects 0 (database IDs start at 1). */
export function parseIdParam(value: unknown): number | null {
  const n = parseIntegerParam(value);
  return n !== null && n > 0 ? n : null;
}

/** True for a JSON number that is a positive safe integer. */
export function isValidId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

/** Validate that a request body is an array of valid IDs (empty is allowed: no-op). */
export function parseIdList(body: unknown, maxLength = 10000): number[] | null {
  if (!Array.isArray(body) || body.length > maxLength) {
    return null;
  }
  return body.every(isValidId) ? (body as number[]) : null;
}

/** Validate a request body of `{ id, grade }` entries for batch grade updates. */
export function parseGradeUpdates(
  body: unknown,
  maxLength = 10000,
): Array<{ id: number; grade: string }> | null {
  if (!Array.isArray(body) || body.length > maxLength) {
    return null;
  }
  const valid = body.every(
    (e) =>
      e !== null &&
      typeof e === "object" &&
      isValidId((e as { id?: unknown }).id) &&
      typeof (e as { grade?: unknown }).grade === "string" &&
      (e as { grade: string }).grade.length <= 50,
  );
  if (!valid) return null;
  // Copy only the validated fields so extra properties never reach Prisma.
  return body.map((e) => ({ id: e.id, grade: e.grade }));
}
