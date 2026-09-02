/**
 * Usage context: whether the UI presents itself as a school library
 * ("Klasse"/"Lehrkraft" fields visible) or a club/organisation library
 * (those fields hidden, terminology kept generic).
 *
 * Resolved once per process, same design as `LOCALE` in `lib/i18n/index.ts`:
 * fixed per deployment, no runtime switching, no React context/hook.
 *
 * Set via `.env`:
 *
 *   USAGE_CONTEXT=club
 *
 * Server-side code reads this directly from `process.env`. Client-side code
 * can't see unprefixed env vars at all, so `pages/_document.tsx` injects the
 * server-resolved value as `window.__OPENLIBRY_USAGE_CONTEXT__` — an inline
 * script in `<head>`, which runs before any bundle code — and the client
 * reads that instead. This also means it stays correct at container runtime
 * for deployments that never pass this var at `next build` time (e.g. the
 * prebuilt Docker image), unlike a `NEXT_PUBLIC_`-prefixed var would.
 */

export type UsageContext = "school" | "club";

const SUPPORTED_USAGE_CONTEXTS: readonly UsageContext[] = [
  "school",
  "club",
] as const;

const DEFAULT_USAGE_CONTEXT: UsageContext = "school";

declare global {
  // eslint-disable-next-line no-var -- runtime global injected by _document.tsx
  var __OPENLIBRY_USAGE_CONTEXT__: string | undefined;
}

function isUsageContext(value: string | undefined): value is UsageContext {
  return (
    value !== undefined &&
    (SUPPORTED_USAGE_CONTEXTS as readonly string[]).includes(value)
  );
}

function resolveUsageContext(): UsageContext {
  // Client: set by the inline script in pages/_document.tsx, before any
  // bundle code runs. Server: undefined, falls through to process.env below.
  const fromRuntimeGlobal =
    typeof globalThis !== "undefined"
      ? globalThis.__OPENLIBRY_USAGE_CONTEXT__
      : undefined;
  if (isUsageContext(fromRuntimeGlobal)) return fromRuntimeGlobal;

  // Server only — Next.js never exposes an unprefixed env var to the client.
  const fromServerEnv =
    typeof process !== "undefined" ? process.env.USAGE_CONTEXT : undefined;
  if (isUsageContext(fromServerEnv)) return fromServerEnv;

  return DEFAULT_USAGE_CONTEXT;
}

/** The active usage context for this process. Fixed at module init. */
export const USAGE_CONTEXT: UsageContext = resolveUsageContext();

/** Guard for UI that only makes sense in a school context (Klasse/Lehrkraft). */
export function showsSchoolFields(): boolean {
  return USAGE_CONTEXT === "school";
}

export function isClubContext(): boolean {
  return USAGE_CONTEXT === "club";
}
