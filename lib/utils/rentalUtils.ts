// lib/utils/rentalUtils.ts

/**
 * Minimal shape required to check whether a book can be extended.
 * Both BookType and RentalsUserType satisfy this interface.
 */
interface ExtendableBook {
  renewalCount: number;
  dueDate?: string | Date | null;
}

/**
 * Returns true if the book can still be extended, i.e. renewalCount <
 * maxExtensions. Extending always sets the new due date to
 * today + EXTENSION_DURATION_DAYS (see entities/book.ts extendBook) — a
 * deliberate choice, not a bug: the librarian is granting a fresh
 * extension from the moment they act, not stacking onto the previous due
 * date, so there is no separate "date guard" beyond the renewal count.
 *
 * Accepts any object with renewalCount + dueDate — works for both
 * BookType (book column) and RentalsUserType (user column).
 */
export function canExtendBook(
  book: ExtendableBook,
  maxExtensions: number,
): boolean {
  return (book.renewalCount ?? 0) < maxExtensions;
}

/**
 * Calls POST /api/book/{bookid}/extend.
 *
 * The server computes the new dueDate from EXTENSION_DURATION_DAYS so the
 * client never sends a date — no date-format issues possible.
 *
 * Returns:
 *   "already_extended"  – server says renewalCount >= MAX_EXTENSIONS
 *   "ok"                – extended successfully
 *   "error"             – network or server error
 */
type ExtendBookApiResult =
  | { status: "ok"; newDueDate: string; renewalCount: number }
  | { status: "already_extended" }
  | { status: "error" };

export async function extendBookApi(
  bookid: number,
): Promise<ExtendBookApiResult> {
  try {
    const res = await fetch(`/api/book/${bookid}/extend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (res.status === 409) return { status: "already_extended" };
    if (!res.ok) return { status: "error" };

    const data = await res.json();
    return {
      status: "ok",
      newDueDate: data.newDueDate,
      renewalCount: data.renewalCount,
    };
  } catch {
    return { status: "error" };
  }
}
