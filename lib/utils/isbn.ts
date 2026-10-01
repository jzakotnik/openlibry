/**
 * ISBN normalization.
 *
 * The helpers in lib/isbn-services strip separators as part of a lookup. This
 * is the same operation on its own, so a value can be brought into a single
 * canonical form before it is stored.
 */

/** Strip to bare ISBN characters (digits + X), uppercased. */
export function cleanIsbn(raw: string | undefined | null): string {
  return (raw ?? "").replace(/[^0-9Xx]/g, "").toUpperCase();
}
