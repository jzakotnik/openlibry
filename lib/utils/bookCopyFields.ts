import { BookType } from "@/entities/BookType";

/**
 * Fields that make sense to carry over when duplicating a book record
 * (e.g. adding another physical copy of the same title).
 *
 * Deliberately excludes anything that identifies a specific physical
 * copy or its current state: id, createdAt/updatedAt, rentalStatus,
 * rentedDate/dueDate, renewalCount, userId.
 */
export const COPYABLE_BOOK_FIELDS = [
  "title",
  "subtitle",
  "author",
  "topics",
  "imageLink",
  "isbn",
  "editionDescription",
  "publisherLocation",
  "pages",
  "summary",
  "minPlayers",
  "publisherName",
  "otherPhysicalAttributes",
  "supplierComment",
  "publisherDate",
  "physicalSize",
  "minAge",
  "maxAge",
  "additionalMaterial",
  "price",
  "externalLinks",
  "shelf",
] as const satisfies readonly (keyof BookType)[];

/**
 * Extract just the copyable fields from a source book, for prefilling
 * a new-book form when the user duplicates an existing entry. The
 * cover image is copied separately (see useBookEditor's copyCoverFromId),
 * since it lives on disk rather than in the book record.
 */
export function pickCopyableBookFields(source: BookType): Partial<BookType> {
  const result: Partial<BookType> = {};

  for (const field of COPYABLE_BOOK_FIELDS) {
    const value = source[field];
    if (value !== undefined && value !== null) {
      (result as Record<string, unknown>)[field] = value;
    }
  }

  return result;
}
