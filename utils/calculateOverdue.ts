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

export function calculateOverdue(d: Date) {
  const dueDate = dayjs(d);
  const now = dayjs();
  const dueDifference = now.diff(dueDate, "days");
  return dueDifference;
}
