import { BookType } from "@/entities/BookType";

export function hasOverdueBooks(rentalsUser: Array<BookType>) {
  let overdue = false;
  //check if books are overdue
  if (rentalsUser.length > 0) {
    rentalsUser.map((b: any) => {
      b.remainingDays > 0 ? (overdue = true) : (overdue = false);
    });
  }
  return overdue;
}
