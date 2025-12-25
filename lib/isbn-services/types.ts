/**
 * Shared types and utilities for ISBN lookup services
 */

export type BookFormData = {
  title?: string;
  author?: string;
  subtitle?: string;
  topics?: string;
  summary?: string;
  isbn?: string;
  editionDescription?: string;
  publisherName?: string;
  publisherLocation?: string;
  publisherDate?: string;
  pages?: string;
  minAge?: string;
  maxAge?: string;
  price?: string;
  externalLinks?: string;
  additionalMaterial?: string;
  minPlayers?: string;
  otherPhysicalAttributes?: string;
  supplierComment?: string;
  physicalSize?: string;
};

/**
 * Interface for ISBN lookup services
 */
export interface IsbnLookupService {
  name: string;
  fetch(isbn: string): Promise<BookFormData | null>;
}

/**
 * Check if a string looks like an ISBN (10 or 13 digits, optionally with hyphens)
 */
export function isIsbnLike(value: string): boolean {
  const cleaned = value.replace(/[-\s]/g, "");
  return /^(978|979)\d{10}$/.test(cleaned) || /^\d{9}[\dXx]$/.test(cleaned);
}

/**
 * Normalize ISBN: remove hyphens/spaces
 */
export function normalizeIsbn(value: string): string {
  return value.replace(/[-\s]/g, "");
}

/**
 * Check if book data is valid (has at least a title)
 */
export function isValidBookData(
  data: BookFormData | null
): data is BookFormData {
  return (
    data !== null && typeof data.title === "string" && data.title.length > 0
  );
}

/**
 * Create an empty BookFormData object with all fields undefined
 */
export function createEmptyBookData(): BookFormData {
  return {
    title: undefined,
    author: undefined,
    subtitle: undefined,
    topics: undefined,
    summary: undefined,
    isbn: undefined,
    editionDescription: undefined,
    publisherName: undefined,
    publisherLocation: undefined,
    publisherDate: undefined,
    pages: undefined,
    minAge: undefined,
    maxAge: undefined,
    price: undefined,
    externalLinks: undefined,
    additionalMaterial: undefined,
    minPlayers: undefined,
    otherPhysicalAttributes: undefined,
    supplierComment: undefined,
    physicalSize: undefined,
  };
}

/**
 * Extract page number from various formats:
 * - "608 Seiten" → "608"
 * - "608 S." → "608"
 * - "xii, 345 pages" → "345"
 * - "320p" → "320"
 * - "256" → "256"
 * Returns undefined if no number found
 */
export function extractPageNumber(
  pagesStr: string | undefined
): number | undefined {
  if (!pagesStr) return undefined;

  // Try to find a number (possibly the largest one, as Roman numerals come first)
  const numbers = pagesStr.match(/\d+/g);
  if (!numbers || numbers.length === 0) return undefined;

  // Return the largest number (main content pages, not preface)
  const largest = numbers.reduce((max, num) => {
    const n = parseInt(num, 10);
    return n > max ? n : max;
  }, 0);
  console.log("Extracted page number", largest);
  return largest > 0 ? largest : undefined;
}

/**
 * Clean title from library sorting indicators.
 * DNB uses special characters to mark articles that should be ignored when sorting:
 * - "˜Derœ Morgen" → "Der Morgen"
 * - "¬Das¬ Buch" → "Das Buch"
 * - "<<Der>> Morgen" → "Der Morgen"
 */
export function cleanTitle(title: string | undefined): string | undefined {
  if (!title) return undefined;

  return (
    title
      // Remove DNB non-sort indicators: ˜...œ
      .replace(/˜([^œ]*)œ\s*/g, "$1 ")
      // Remove alternate non-sort indicators: ¬...¬
      .replace(/¬([^¬]*)¬\s*/g, "$1 ")
      // Remove angle bracket indicators: <<...>>
      .replace(/<<([^>]*)>>\s*/g, "$1 ")
      // Remove guillemet indicators: «...»
      .replace(/«([^»]*)»\s*/g, "$1 ")
      // Clean up multiple spaces
      .replace(/\s+/g, " ")
      .trim()
  );
}
