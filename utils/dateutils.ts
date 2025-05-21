import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import { User } from "@prisma/client";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

export const TIMEZONE = "Europe/Berlin";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export function convertDateToDayString(
  d: string | Date | null | undefined
): string {
  return d ? dayjs(d).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
}

export function convertDayToISOString(d: string): string {
  return dayjs(d).toISOString();
}

export function convertDateToTimeString(
  d: string | Date | null | undefined
): string {
  return d
    ? dayjs(d).format("YYYY-MM-DD HH:mm")
    : dayjs().format("YYYY-MM-DD HH:mm");
}

export function convertStringToDay(d: string | Date | undefined): Dayjs {
  //console.log("Converting string to dayjs", d, dayjs(d, "YYYY-MM-DD"));
  return d ? dayjs(d, "YYYY-MM-DD") : dayjs("YYYY-MM-DD");
}

export function extendWeeks(d: Date, weeks: number): Dayjs {
  //console.log("Converting string to dayjs", d, dayjs(d));
  const newDate = dayjs(d).add(weeks, "week");
  return newDate;
}

export function sameDay(d: Date, o: Dayjs): boolean {
  return o.isSame(d, "day");
}

export function extendDays(d: Date, days: number): Dayjs {
  //console.log("Converting string to dayjs", d, dayjs(d));
  console.log("Extending book by ", days, d);
  const newDate = dayjs(d).add(days, "day");
  return newDate;
}

export function currentTime(): Date {
  return dayjs().toDate();
}

export function replaceUsersDateString(users: Array<User>): Array<UserType> {
  const convertedUsers = users.map((u) => {
    return {
      ...u,
      createdAt: convertDateToDayString(u.createdAt),
      updatedAt: convertDateToDayString(u.updatedAt),
    };
  });
  return convertedUsers;
}

export function replaceUserDateString(user: User): UserType {
  return {
    ...user,
    createdAt: convertDateToDayString(user.createdAt),
    updatedAt: convertDateToDayString(user.updatedAt),
  };
}

export function replaceBookDateString(book: BookType): any {
  return {
    ...book,
    createdAt: convertDateToDayString(book.createdAt),
    updatedAt: convertDateToDayString(book.updatedAt),
    rentedDate: convertDateToDayString(book.rentedDate),
    dueDate: convertDateToDayString(book.dueDate),
  };
}

export function replaceBookStringDate(book: BookType): BookType {
  return {
    ...book,
    createdAt: convertStringToDay(book.createdAt).toDate(),
    updatedAt: convertStringToDay(book.updatedAt).toDate(),
    rentedDate: convertStringToDay(book.rentedDate).toDate(),
    dueDate: convertStringToDay(book.dueDate).toDate(),
  };
}
