import { RentalsUserType } from "@/entities/RentalsUserType";

export function hasOverdueBooks(rentalsUser: Array<RentalsUserType>): boolean {
  let overdue = false;
  //check if books are overdue
  if (rentalsUser.length > 0) {
    rentalsUser.map((b: RentalsUserType) => {
      b.remainingDays > 0 ? (overdue = true) : (overdue = false);
    });
  }
  return overdue;
}
