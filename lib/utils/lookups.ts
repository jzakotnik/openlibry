import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";

export function getBookFromID(id: number, books: Array<BookType>) {
  const firstMatch = books.filter((item) => item.id == id);
  //console.log("First match", firstMatch);
  return firstMatch[0];
}
export function stripZerosFromSearch(query: string): string {
  return /^\d+$/.test(query) ? query.replace(/^0+/, "") : query;
}

export default function userNameforBook(
  users: Array<UserType>,
  userbookid: number,
): string {
  if (!userbookid) return "";
  const foundUser = users.filter((u) => u.id == userbookid);
  //console.log("Filter user", foundUser, userbookid);
  return foundUser.length == 0
    ? ""
    : foundUser[0].firstName + " " + foundUser[0].lastName;
}
