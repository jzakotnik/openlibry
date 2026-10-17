import { resolveLoginImage } from "@/lib/loginImage";

export type LoginStyle = "image" | "book";

/**
 * Resolve the login page's left-hand visual (LOGIN_STYLE env):
 *   - "book"  → animated sketch book where spinning circles write "openlibry"
 *   - "image" → static background image (LOGIN_IMAGE or the bundled splash)
 *   - unset   → "book", unless LOGIN_IMAGE is set: an existing custom image
 *               keeps being shown until LOGIN_STYLE=book is chosen explicitly.
 */
export function resolveLoginStyle(): LoginStyle {
  const raw = process.env.LOGIN_STYLE?.trim().toLowerCase();
  if (raw === "book") return "book";
  if (raw === "image") return "image";
  return resolveLoginImage() ? "image" : "book";
}
