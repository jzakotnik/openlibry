import { AnthropicService } from "./AnthropicService";
import { GoogleService } from "./GoogleService";
import type { AiTaggingService } from "./types";

export * from "./types";
export { loadTaggedCorpus, selectExamples } from "./examples";
export { getFacetMap, FACETS, type Facet } from "./facets";
export { computeStyleProfile, renderStyleProfile } from "./style";
export { rankTopics } from "./rankTopics";
export { reconcileTags } from "./reconcile";
export { gatherSourceCandidates } from "./sources";

/**
 * Returns the configured AI tagging provider, or null when no provider key is
 * set. The presence of a key IS the feature flag — with no key the whole
 * feature is inert (no button rendered, endpoints report disabled).
 *
 * Selection is explicit, not order-of-.env magic:
 *   1. If AI_TAGGING_PROVIDER names a provider AND that provider's key is set,
 *      it wins (lets an operator pin the choice unambiguously).
 *   2. Otherwise the first provider in PRECEDENCE whose key is present wins.
 */
const PROVIDERS: Record<string, { key: string; svc: AiTaggingService }> = {
  anthropic: { key: "ANTHROPIC_API_KEY", svc: AnthropicService },
  google: { key: "GEMINI_API_KEY", svc: GoogleService },
};
const PRECEDENCE = ["anthropic", "google"] as const;

export function getAiTaggingService(): AiTaggingService | null {
  const pinned = process.env.AI_TAGGING_PROVIDER?.trim().toLowerCase();
  if (pinned) {
    const p = PROVIDERS[pinned];
    if (p && process.env[p.key]) return p.svc;
    // Pinned but its key is missing → feature stays off rather than silently
    // falling back to a provider the operator didn't ask for.
    return null;
  }
  for (const name of PRECEDENCE) {
    const p = PROVIDERS[name];
    if (process.env[p.key]) return p.svc;
  }
  return null;
}

/** Whether AI tagging is available in this deployment. */
export function isAiTaggingEnabled(): boolean {
  return getAiTaggingService() !== null;
}

/** Configured max tags per book (default 5). */
export function getMaxTags(): number {
  const n = parseInt(process.env.AI_TAGGING_MAX_TAGS ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 5;
}
