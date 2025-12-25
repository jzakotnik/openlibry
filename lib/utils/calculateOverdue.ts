import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

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
