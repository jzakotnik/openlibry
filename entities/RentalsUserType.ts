export interface RentalsUserType {
  id: number;
  title: string; //title of the book
  lastName: string;
  firstName: string;
  remainingDays: number;
  dueDate: string | Date;
  renewalCount: number;
  userid: number;
}
