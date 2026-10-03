import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import { User } from "@prisma/client";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

// =============================================================================
// Timezone configuration
//
// Rental business logic (rentedDate, dueDate, extensions, overdue checks) only
// ever cares about *which calendar day* something falls on, never the time of
// day. But "which calendar day is it right now" is meaningless without a
// timezone — the school running this instance has one specific local
// timezone, which is very likely not the timezone of whatever server/
// container happens to host the app. APP_TIMEZONE lets a deployment declare
// that explicitly instead of silently inheriting the host's TZ.
// =============================================================================
export function getAppTimezone(): string {
  return process.env.APP_TIMEZONE || "Europe/Berlin";
}

/**
 * Today's calendar date ("YYYY-MM-DD") from the school's point of view, i.e.
 * in the app's configured timezone — not the server host's timezone.
 */
export function todayDateString(): string {
  return dayjs().tz(getAppTimezone()).format("YYYY-MM-DD");
}

// =============================================================================
// Calendar-day-only values (rentedDate, dueDate)
//
// These fields represent a *date*, not an instant — a due date has no
// meaningful "time of day". We always store them as a full ISO-8601 datetime
// anchored to UTC midnight (a Prisma DateTime requirement), but arithmetic
// and comparisons on them must stay in that same UTC-midnight frame so the
// calendar date is never accidentally reinterpreted through some other
// timezone. This is what keeps these values immune to both the server host's
// timezone (unlike the school's, it's arbitrary/incidental) and the app's
// configured timezone (only used to decide what "today" is).
// =============================================================================

/**
 * Convert a date-only string ("YYYY-MM-DD") or a full ISO-8601 datetime
 * string into a full ISO-8601 datetime anchored to UTC midnight. The
 * calendar date survives a round-trip through JSON serialization regardless
 * of where the code runs.
 */
export function convertDateOnlyToUtcIsoString(d: string): string {
  return dayjs.utc(d).toISOString();
}

/** Today's calendar date (see todayDateString), stored as a UTC-midnight ISO string. */
export function todayAsUtcIsoString(): string {
  return convertDateOnlyToUtcIsoString(todayDateString());
}

/**
 * Like convertDateOnlyToUtcIsoString, but tolerant of the kind of input
 * that shows up in an untrusted spreadsheet import: a blank cell, or
 * garbage text that isn't a date at all. Returns null instead of
 * throwing, or (worse) silently converting a missing value into "the
 * current instant" the way `dayjs(undefined)` would.
 */
export function tryConvertDateOnlyToUtcIsoString(d: unknown): string | null {
  if (d === undefined || d === null || d === "") return null;
  const parsed = dayjs.utc(d as string);
  return parsed.isValid() ? parsed.toISOString() : null;
}

/**
 * Add N calendar days to a stored calendar-day value (or a "YYYY-MM-DD"
 * string), returned as a UTC-midnight ISO string. Pure calendar-day
 * arithmetic in UTC — never affected by time-of-day, the app's configured
 * timezone, or DST transitions.
 */
export function addCalendarDays(
  d: string | Date,
  days: number,
): string {
  return dayjs.utc(d).add(days, "day").toISOString();
}

/**
 * Whole-day difference between two calendar-day values (stored ISO strings
 * or "YYYY-MM-DD"), ignoring time-of-day entirely. Positive when `a`'s
 * calendar day is after `b`'s.
 */
export function calendarDaysDiff(
  a: string | Date | null | undefined,
  b: string | Date | null | undefined,
): number {
  if (!a || !b) return NaN;
  return dayjs.utc(a).startOf("day").diff(dayjs.utc(b).startOf("day"), "day");
}

/**
 * Format a calendar-day-only value (rentedDate, dueDate) as "YYYY-MM-DD".
 * Reads the calendar date directly off the UTC-midnight-anchored storage
 * value — deliberately NOT timezone-converted, since these values already
 * represent a specific calendar day regardless of where they're displayed.
 */
export function formatCalendarDayString(
  d: string | Date | null | undefined,
): string {
  return d ? dayjs.utc(d).format("YYYY-MM-DD") : todayDateString();
}

// =============================================================================
// True instants (createdAt, updatedAt, audit timestamps)
//
// Unlike rentedDate/dueDate, these represent a genuine moment in time (set by
// Prisma's @default(now())), so *when* they get displayed as a calendar
// date/time legitimately depends on the viewer's timezone — the school's
// configured timezone, not the server host's.
// =============================================================================

/** Format a real instant as "YYYY-MM-DD" in the app's configured timezone. */
export function formatInstantDayString(
  d: string | Date | null | undefined,
): string {
  return d ? dayjs(d).tz(getAppTimezone()).format("YYYY-MM-DD") : todayDateString();
}

/** Format a real instant as "YYYY-MM-DD HH:mm" in the app's configured timezone. */
export function convertDateToTimeString(
  d: string | Date | null | undefined,
): string {
  return d
    ? dayjs(d).tz(getAppTimezone()).format("YYYY-MM-DD HH:mm")
    : dayjs().tz(getAppTimezone()).format("YYYY-MM-DD HH:mm");
}

/**
 * Today's calendar date as a stored (UTC-midnight-anchored) ISO string,
 * using whichever "local" clock the *executing* runtime has — the
 * browser's clock when called client-side, the host OS's clock when
 * called server-side.
 *
 * Deliberately does NOT use getAppTimezone()/APP_TIMEZONE: that env var
 * is only readable server-side (Next.js never inlines a non-
 * NEXT_PUBLIC_-prefixed var into the client bundle), so code that also
 * runs in the browser — like a new-book form's default date, or a
 * librarian's batch scan — would silently ignore a configured
 * non-default timezone and always fall back to the default. For those
 * user-facing, client-triggered "today" values, the browser's own local
 * date (i.e. wherever the librarian is physically sitting) is the
 * correct source of truth anyway, and needs no server configuration.
 *
 * Use `todayAsUtcIsoString()` instead for server-only business logic
 * (renting, extending, returning, overdue checks) where "today" must
 * reflect the school's configured timezone regardless of where the
 * Node process happens to be hosted.
 */
export function localCalendarDateAsUtcIsoString(): string {
  return convertDateOnlyToUtcIsoString(dayjs().format("YYYY-MM-DD"));
}

export function replaceUserDateString(user: User): UserType {
  return {
    ...user,
    createdAt: formatInstantDayString(user.createdAt),
    updatedAt: formatInstantDayString(user.updatedAt),
  };
}

export function replaceBookDateString(book: BookType): any {
  return {
    ...book,
    createdAt: formatInstantDayString(book.createdAt),
    updatedAt: formatInstantDayString(book.updatedAt),
    rentedDate: formatCalendarDayString(book.rentedDate),
    dueDate: formatCalendarDayString(book.dueDate),
  };
}
