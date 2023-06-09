import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import { User, Book } from "@prisma/client";
import { UserType } from "@/entities/UserType";
import { BookType } from "@/entities/BookType";

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
