export type LoginStyle = "image" | "book";

/**
 * Resolve the login page's left-hand visual (LOGIN_STYLE env):
 *   - "book"  → animated sketch book where spinning circles write "openlibry"
 *   - anything else / unset → static background image (LOGIN_IMAGE or the bundled splash)
 */
export function resolveLoginStyle(): LoginStyle {
  return process.env.LOGIN_STYLE?.trim().toLowerCase() === "book"
    ? "book"
    : "image";
}
