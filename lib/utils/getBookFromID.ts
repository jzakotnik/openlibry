import { BookType } from "@/entities/BookType";

export function getBookFromID(id: number, books: Array<BookType>) {
  const firstMatch = books.filter((item) => item.id == id);
  console.log("First match", firstMatch);
  return firstMatch[0];
}
