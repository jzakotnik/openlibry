/**
 * ISBN normalization + ISBN-10 ⇄ ISBN-13 conversion.
 *
 * The existing helpers in lib/isbn-services only strip separators; matching a
 * book across editions requires knowing that an ISBN-10 and its ISBN-13 form
 * denote the same edition. `isbnVariants` returns every equivalent form so a
 * lookup can match a copy catalogued as ISBN-10 against a scanned ISBN-13.
 */

/** Strip to bare ISBN characters (digits + X), uppercased. */
export function cleanIsbn(raw: string | undefined | null): string {
  return (raw ?? "").replace(/[^0-9Xx]/g, "").toUpperCase();
}

function isbn13CheckDigit(first12: string): string {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Number(first12[i]) * (i % 2 === 0 ? 1 : 3);
  }
  return String((10 - (sum % 10)) % 10);
}

function isbn10CheckDigit(first9: string): string {
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(first9[i]) * (10 - i);
  const check = (11 - (sum % 11)) % 11;
  return check === 10 ? "X" : String(check);
}

/** Convert a valid ISBN-10 to ISBN-13, or null if not a well-formed ISBN-10. */
export function isbn10to13(raw: string | undefined | null): string | null {
  const c = cleanIsbn(raw);
  if (!/^\d{9}[\dX]$/.test(c)) return null;
  const core = "978" + c.slice(0, 9);
  return core + isbn13CheckDigit(core);
}

/** Convert a 978-prefixed ISBN-13 to ISBN-10, or null (979 has no ISBN-10). */
export function isbn13to10(raw: string | undefined | null): string | null {
  const c = cleanIsbn(raw);
  if (!/^\d{13}$/.test(c) || !c.startsWith("978")) return null;
  const core = c.slice(3, 12);
  return core + isbn10CheckDigit(core);
}

/**
 * All equivalent forms of an ISBN (the cleaned input plus its ISBN-10/13
 * counterpart), deduped. Empty input → []. Use to match a book regardless of
 * which form it was catalogued in.
 */
export function isbnVariants(raw: string | undefined | null): string[] {
  const c = cleanIsbn(raw);
  if (!c) return [];
  const set = new Set<string>([c]);
  if (c.length === 10) {
    const v = isbn10to13(c);
    if (v) set.add(v);
  } else if (c.length === 13) {
    const v = isbn13to10(c);
    if (v) set.add(v);
  }
  return [...set];
}
