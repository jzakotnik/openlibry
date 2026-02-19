import { BookType } from "@/entities/BookType";
import dayjs from "dayjs";

export function calcExtensionDueDate(extensionDays: number): dayjs.Dayjs {
  return dayjs().add(extensionDays, "day");
}

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
