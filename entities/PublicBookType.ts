/**
 * Public-facing book shape exposed by /api/public/books.
 *
 * This type is the authoritative whitelist of fields that may be sent to
 * unauthenticated clients. Any field NOT listed here must never appear in
 * a public API response — enforce this at the Prisma `select` level, not
 * by post-filtering a full BookType object.
 *
 * Deliberately excluded:
 *   - userId          (internal FK, privacy)
 *   - imageLink       (legacy DB field, always empty — use /api/images/[id])
 *   - rentedDate      (operational detail, not needed for public view)
 *   - dueDate         (operational detail, not needed for public view)
 *   - createdAt       (internal metadata)
 *   - updatedAt       (internal metadata)
 *   - user            (relation — would expose PII)
 */
export interface PublicBookType {
  id: number;
  title: string | null;
  author: string | null;
  isbn: string | null;
  topics: string | null;
  rentalStatus: string;
  /** Always `/api/images/${id}` — served by the images route, auth-excluded. */
  coverUrl: string;
}
