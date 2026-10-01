import { BookType } from "@/entities/BookType";
import { cleanIsbn } from "@/lib/utils/isbn";

/**
 * Classifies a scanned/typed code as either an ISBN (a commercial barcode
 * printed on the book itself, used to look up media that may not exist in
 * the catalog yet) or an internal library id (the barcode OpenLibry prints
 * and sticks on its own copies, see components/book/edit/BookBarcode.tsx).
 */
export type ScanCodeType = "isbn" | "id";

export interface ClassifiedScan {
  type: ScanCodeType;
  isbn?: string;
  id?: number;
}

function isValidIsbn13(digits: string): boolean {
  if (!/^\d{13}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Number(digits[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return check === Number(digits[12]);
}

function isValidIsbn10(code: string): boolean {
  if (!/^\d{9}[\dX]$/.test(code)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(code[i]) * (10 - i);
  sum += code[9] === "X" ? 10 : Number(code[9]);
  return sum % 11 === 0;
}

/**
 * Classify a scanned code. Internal library ids are short integers assigned
 * by OpenLibry itself, so any long or checksum-valid ISBN-shaped code is
 * treated as an ISBN lookup even if its checksum doesn't validate (cheap
 * scanners occasionally mis-read a digit) — an unmatched ISBN routes to
 * "create new book", while an unmatched short id is just an error, since
 * ids are never pre-printed on media OpenLibry doesn't already know about.
 */
export function classifyScan(raw: string): ClassifiedScan | null {
  const cleaned = cleanIsbn(raw.trim());
  if (!cleaned) return null;

  if (isValidIsbn13(cleaned) || isValidIsbn10(cleaned)) {
    return { type: "isbn", isbn: cleaned };
  }

  const digitsOnly = /^\d+$/.test(cleaned);
  if (!digitsOnly) return null;

  if (cleaned.length >= 10) {
    return { type: "isbn", isbn: cleaned };
  }

  return { type: "id", id: parseInt(cleaned, 10) };
}

/**
 * Resolve a classified scan against the currently known book list. When
 * several copies share the same ISBN, prefer one that's actually available
 * to rent, then one that's rented (so scanning any copy's ISBN can return
 * it), falling back to the first match.
 */
export function findBookForScan(
  classified: ClassifiedScan,
  books: BookType[],
): BookType | undefined {
  if (classified.type === "id") {
    return books.find((b) => b.id === classified.id);
  }

  const matches = books.filter(
    (b) => b.isbn && cleanIsbn(b.isbn) === classified.isbn,
  );
  if (matches.length === 0) return undefined;

  return (
    matches.find((b) => b.rentalStatus === "available") ??
    matches.find((b) => b.rentalStatus === "rented") ??
    matches[0]
  );
}
