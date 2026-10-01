/**
 * Error handling helpers for API routes.
 *
 * Raw errors (Prisma messages in particular) contain table/column names and
 * query details, so routes must not echo them to the client. Use
 * `userFacingError(message)` for messages that are safe and meant to be shown
 * (for example "this user ID is already taken"); everything else gets a
 * generic message from `publicErrorMessage` while the full error is written to
 * the server log.
 */

// Checked by marker rather than `instanceof`, which breaks when a module is
// instantiated twice (dev HMR, separately bundled API routes).
const USER_FACING = "userFacing";

export function userFacingError(message: string): Error {
  return Object.assign(new Error(message), { [USER_FACING]: true });
}

export function publicErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error &&
    (error as unknown as Record<string, unknown>)[USER_FACING] === true
    ? error.message
    : fallback;
}
