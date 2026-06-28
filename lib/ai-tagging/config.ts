/**
 * Import-light configuration for AI tagging: provider selection, model names,
 * the feature flag, max-tags, and the facet vocabulary.
 *
 * Deliberately free of SDK and `fs` imports so it can be pulled into page
 * modules (e.g. a getServerSideProps feature check) without dragging
 * server-only code into the client bundle. The single source of truth for all
 * of this — services, the facet classifier, and pages import from here rather
 * than redeclaring provider precedence or model names.
 */

export type Provider = "anthropic" | "google";

/** Env var holding each provider's API key. */
const PROVIDER_KEYS: Record<Provider, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  google: "GEMINI_API_KEY",
};

/** Order a provider is chosen when none is pinned via AI_TAGGING_PROVIDER. */
const PRECEDENCE: readonly Provider[] = ["anthropic", "google"];

/** Model per provider, overridable via env (kept separate so a name can't cross). */
export const ANTHROPIC_MODEL =
  process.env.AI_TAGGING_MODEL || "claude-haiku-4-5";
export const GOOGLE_MODEL =
  process.env.GOOGLE_AI_TAGGING_MODEL || "gemini-2.5-flash";

/**
 * The active provider, or null when the feature is off (no key). The presence
 * of a key IS the feature flag. AI_TAGGING_PROVIDER pins the choice if that
 * provider's key is set; otherwise the first provider in PRECEDENCE with a key
 * wins. Pinned-but-keyless stays off rather than silently falling back.
 */
export function pickProvider(): Provider | null {
  const pinned = process.env.AI_TAGGING_PROVIDER?.trim().toLowerCase();
  if (pinned) {
    const p = pinned as Provider;
    return PROVIDER_KEYS[p] && process.env[PROVIDER_KEYS[p]] ? p : null;
  }
  for (const p of PRECEDENCE) {
    if (process.env[PROVIDER_KEYS[p]]) return p;
  }
  return null;
}

/** Whether AI tagging is available in this deployment. */
export function isAiTaggingEnabled(): boolean {
  return pickProvider() !== null;
}

/** Configured max tags per book (default 5). */
export function getMaxTags(): number {
  const n = parseInt(process.env.AI_TAGGING_MAX_TAGS ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 5;
}

/**
 * Domain-neutral tag facets. The single source of truth shared by the facet
 * classifier (facets.ts) and the grouped-vocabulary renderer (prompt.ts).
 */
export const FACETS = [
  "Gattung",
  "Epoche",
  "Region",
  "Strömung",
  "Thema",
  "Sonstiges",
] as const;
export type Facet = (typeof FACETS)[number];
/** Order facets are presented in the prompt (most defining first). */
export const FACET_ORDER: readonly Facet[] = FACETS;
