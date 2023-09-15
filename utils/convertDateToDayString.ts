import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import { User } from "@prisma/client";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

export const TIMEZONE = "Europe/Berlin";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export function convertDateToDayString(d: Date) {
  const convertedDate = dayjs(d);
  return convertedDate.format("YYYY-MM-DD");
}

export function convertStringToDay(d: string) {
  //console.log("Converting string to dayjs", d, dayjs(d, "YYYY-MM-DD"));
  return dayjs(d, "YYYY-MM-DD");
}

export function extendWeeks(d: Date, weeks: number) {
  console.log("Converting string to dayjs", d, dayjs(d));
  const newDate = dayjs(d).add(weeks, "week");
  return newDate;
}

export function currentTime() {
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

export function replaceBookDateString(book: any): BookType {
  return {
    ...book,
    createdAt: convertDateToDayString(book.createdAt),
    updatedAt: convertDateToDayString(book.updatedAt),
    rentedDate: convertDateToDayString(book.rentedDate),
    dueDate: convertDateToDayString(book.dueDate),
  };
}

export function replaceBookStringDate(book: any): BookType {
  return {
    ...book,
    createdAt: convertStringToDay(book.createdAt).toDate(),
    updatedAt: convertStringToDay(book.updatedAt).toDate(),
    rentedDate: convertStringToDay(book.rentedDate).toDate(),
    dueDate: convertStringToDay(book.dueDate).toDate(),
  };
}
