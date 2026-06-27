import { AnthropicService } from "./AnthropicService";
import type { AiTaggingService } from "./types";

export * from "./types";
export { rankTopics } from "./rankTopics";
export { postProcessTags } from "./postProcess";

/**
 * Returns the configured AI tagging provider, or null when no provider key is
 * set. The presence of a key IS the feature flag — with no key the whole
 * feature is inert (no button rendered, endpoints report disabled). Selection
 * mirrors the ISBN-service cascade: first provider whose key is present wins.
 */
export function getAiTaggingService(): AiTaggingService | null {
  if (process.env.ANTHROPIC_API_KEY) return AnthropicService;
  // Future providers slot in here, gated on their own key.
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
