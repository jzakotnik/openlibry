import { BookType } from "@/entities/BookType";

export function getBookFromID(id: number, books: Array<BookType>) {
  const firstMatch = books.filter((item) => item.id == id);
  return firstMatch[0];
}
