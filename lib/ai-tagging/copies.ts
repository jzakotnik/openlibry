/**
 * A library holds several physical copies of the same title, one Book row
 * each, all carrying the same topics. Counting rows therefore counts copies,
 * and a title held 35 times speaks 35 times: it distorts the tag frequencies
 * that rank the vocabulary and the median that tells the model how many tags
 * this library usually gives. What the model should learn from is the
 * cataloguing decisions, and a title is one decision however many copies of it
 * stand on the shelf.
 *
 * Copies are identified the way the rest of the app identifies them: by ISBN,
 * falling back to title + author when there is none.
 */
export function collapseCopies<
  T extends { isbn?: string | null; title?: string | null; author?: string | null },
>(rows: T[]): T[] {
  const seen = new Map<string, T>();
  for (const row of rows) {
    const isbn = row.isbn?.trim();
    const key = isbn
      ? `i:${isbn}`
      : `t:${(row.title ?? "").trim().toLowerCase()}|${(row.author ?? "")
          .trim()
          .toLowerCase()}`;
    if (!seen.has(key)) seen.set(key, row);
  }
  return [...seen.values()];
}
