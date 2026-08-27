/**
 * Dayjs locale initialisation.
 *
 * Call `setupDayjs()` once at app startup (from `pages/_app.tsx`) to
 * activate the dayjs locale that matches the active OpenLibry locale.
 *
 * How dayjs locales work (dayjs 1.11)
 * -----------------------------------
 * - `import "dayjs/locale/de"` REGISTERS the German locale but does NOT
 *   activate it (the locale file calls `dayjs.locale(obj, null, true)` —
 *   the trailing `true` means "register only").
 * - `dayjs.locale("de")` activates a previously-registered locale.
 * - English is built into dayjs core and always available without an
 *   explicit import.
 *
 * Existing component files (`BookRentalList.tsx`, `UserRentalList.tsx`,
 * `UserEditForm.tsx`, etc.) also do `import "dayjs/locale/de"` as a
 * side-effect. That's harmless duplication — registration is idempotent,
 * and because those imports don't activate the locale, they won't
 * override `setupDayjs()`'s choice.
 */

import dayjs from "dayjs";
// Always register German — some components also import this, which is fine:
// registration is idempotent and does not change the active locale.
import "dayjs/locale/de";

import { LOCALE } from "./index";

/**
 * Activate the dayjs locale that matches the configured OpenLibry locale.
 * Safe to call multiple times, but only needs to be called once.
 */
export function setupDayjs(): void {
  dayjs.locale(LOCALE);
}
