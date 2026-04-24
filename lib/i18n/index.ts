/**
 * Minimal i18n for OpenLibry.
 *
 * Design principles
 * -----------------
 * - Locale is fixed per deployment via the `OPENLIBRY_LOCALE` env var.
 *   There is no runtime switching, no React context, no provider, no hooks.
 * - `t()` is a plain function — import it anywhere (client or server) and
 *   call it. Works identically in SSR and in the browser because the locale
 *   is baked in at build time via `NEXT_PUBLIC_OPENLIBRY_LOCALE`.
 * - Missing keys fall back: active locale → German → raw key string.
 *   This means a missing English translation surfaces as the German text
 *   (never a broken UI); a typo in the key surfaces as the key itself
 *   (so devs notice immediately).
 *
 * Usage
 * -----
 *   import { t } from "@/lib/i18n";
 *
 *   <span>{t("topbar.logout")}</span>
 *   <span>{t("greeting.hello", { name: "Ada" })}</span>  // with {name} placeholders
 *
 * Setting the locale
 * ------------------
 * In `.env`:
 *
 *   NEXT_PUBLIC_OPENLIBRY_LOCALE=en
 *
 * The `NEXT_PUBLIC_` prefix is required so Next.js inlines the value into
 * the client bundle at build time. A rebuild is needed after changing it.
 * For server-only code, `OPENLIBRY_LOCALE` (without the prefix) is also
 * accepted as a fallback.
 */

import { de } from "./de";
import { en } from "./en";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "./types";

// ---------------------------------------------------------------------------
// Locale resolution (runs once at module init)
// ---------------------------------------------------------------------------

function resolveLocale(): Locale {
  // `typeof process` guard keeps this safe in exotic runtimes where
  // `process` may not be defined (e.g. certain edge/worker environments).
  const raw =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_OPENLIBRY_LOCALE ||
        process.env.OPENLIBRY_LOCALE
      : undefined;

  if (raw && (SUPPORTED_LOCALES as readonly string[]).includes(raw)) {
    return raw as Locale;
  }
  return DEFAULT_LOCALE;
}

/** The active locale for this process. Fixed at module init. */
export const LOCALE: Locale = resolveLocale();

// ---------------------------------------------------------------------------
// Dictionary lookup
// ---------------------------------------------------------------------------

const dictionaries = { de, en } as const;

const active = dictionaries[LOCALE];
const fallback = dictionaries[DEFAULT_LOCALE];

/**
 * Walk a dot-separated path into a dictionary. Returns the string at the
 * leaf, or `undefined` if the path doesn't resolve to a string.
 */
function lookup(dict: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : undefined;
}

/**
 * Substitute `{name}` placeholders in a template string.
 *
 * Simple string replacement — no escaping needed since variable names are
 * controlled by the code, not user input.
 */
function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.split(`{${key}}`).join(String(value));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Translation key. Kept as plain `string` for simplicity — dot-paths are
 * a convention, not enforced by the type system. Can be tightened later
 * to a recursive dot-path type if desired.
 */
export type TranslationKey = string;

/**
 * Translate a key. Falls back to German if the key is missing in the
 * active locale, and to the raw key if missing everywhere.
 *
 * @param key   Dot-separated path into the dictionary (e.g. "topbar.logout")
 * @param vars  Optional `{name}` placeholder values
 */
export function t(
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  const str = lookup(active, key) ?? lookup(fallback, key) ?? key;
  return vars ? interpolate(str, vars) : str;
}

export type { Locale } from "./types";
