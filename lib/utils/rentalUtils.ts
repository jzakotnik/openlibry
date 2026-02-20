import { BookType } from "@/entities/BookType";
import { replaceBookStringDate, sameDay } from "@/lib/utils/dateutils";
import dayjs from "dayjs";

/**
 * Returns the dayjs date that a book would be due after an extension,
 * i.e. today + extensionDays.
 */
export function calcExtensionDueDate(extensionDays: number): dayjs.Dayjs {
  return dayjs().add(extensionDays, "day");
}

/**
 * Returns true if a book is eligible for extension:
 * - the new due date would actually be later than the current one
 * - the renewal count has not yet reached the maximum
 */
export function canExtendBook(
  book: Pick<BookType, "renewalCount" | "dueDate">,
  extensionDueDate: dayjs.Dayjs,
  maxExtensions: number,
): boolean {
  return (
    book.renewalCount < maxExtensions &&
    extensionDueDate.isAfter(book.dueDate, "day")
  );
}

export type ExtendBookResult = "already_extended" | "ok" | "error";

/**
 * Calls the book PUT API to extend a rental to extensionDueDate.
 * Returns a discriminated result so callers can handle toasts and
 * state updates in their own way.
 */
export async function extendBookApi(
  bookid: number,
  book: BookType,
  extensionDueDate: dayjs.Dayjs,
): Promise<ExtendBookResult> {
  const newbook = replaceBookStringDate(book) as any;

  if (sameDay(newbook.dueDate, extensionDueDate)) {
    return "already_extended";
  }

  newbook.dueDate = extensionDueDate.toDate();
  newbook.renewalCount = newbook.renewalCount + 1;
  delete newbook.user;
  delete newbook._id;

  try {
    const res = await fetch(`/api/book/${bookid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newbook),
    });
    return res.ok ? "ok" : "error";
  } catch {
    return "error";
  }
}
