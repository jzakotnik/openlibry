// lib/utils/rentalUtils.ts
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isSameOrAfter);

/**
 * Minimal shape required to check whether a book can be extended.
 * Both BookType and RentalsUserType satisfy this interface.
 */
interface ExtendableBook {
  renewalCount: number;
  dueDate?: string | Date | null;
}

/**
 * Returns a dayjs date representing today + extensionDays.
 * Used client-side for canExtendBook() checks (button disabled state).
 */
export function calcExtensionDueDate(extensionDays: number): dayjs.Dayjs {
  return dayjs().add(extensionDays, "day");
}

/**
 * Returns true if the book can be extended:
 *   - renewalCount < maxExtensions  (count guard)
 *   - extensionDueDate is strictly after current dueDate  (date guard)
 *
 * Accepts any object with renewalCount + dueDate — works for both
 * BookType (book column) and RentalsUserType (user column).
 */
export function canExtendBook(
  book: ExtendableBook,
  extensionDueDate: dayjs.Dayjs,
  maxExtensions: number,
): boolean {
  //console.log("CHECK CAN EXTEND BOOK", maxExtensions, book.renewalCount);
  if ((book.renewalCount ?? 0) >= maxExtensions) return false;
  if (!book.dueDate) return false;
  //return extensionDueDate.isAfter(book.dueDate, "day");
  return extensionDueDate.isSameOrAfter(book.dueDate, "day");
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
export async function extendBookApi(
  bookid: number,
): Promise<"already_extended" | "ok" | "error"> {
  try {
    const res = await fetch(`/api/book/${bookid}/extend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (res.status === 409) return "already_extended";
    if (!res.ok) return "error";
    return "ok";
  } catch {
    return "error";
  }
}
