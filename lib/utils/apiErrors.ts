/**
 * Error handling helpers for API routes.
 *
 * Raw errors (Prisma messages in particular) contain table/column names and
 * query details, so routes must not echo them to the client. Throw a
 * `UserFacingError` for messages that are safe and meant to be shown (for
 * example "this user ID is already taken"); everything else gets a generic
 * message while the full error is written to the server log.
 */
export class UserFacingError extends Error {
  // Checked by marker rather than `instanceof`, which breaks when the module
  // is instantiated twice (dev HMR, separately bundled API routes).
  readonly userFacing = true;

  constructor(message: string) {
    super(message);
    this.name = "UserFacingError";
  }
}

export function publicErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error &&
    (error as { userFacing?: unknown }).userFacing === true
    ? error.message
    : fallback;
}
