import { AnthropicService } from "./AnthropicService";
import { pickProvider, type Provider } from "./config";
import { GoogleService } from "./GoogleService";
import type { AiTaggingService } from "./types";

export * from "./types";
export * from "./config";
export { loadTaggedCorpus, selectExamples } from "./examples";
export { getFacetMap } from "./facets";
export { computeStyleProfile, renderStyleProfile } from "./style";
export { rankTopics } from "./rankTopics";
export { reconcileTags } from "./reconcile";
export { gatherSourceCandidates } from "./sources";

const SERVICES: Record<Provider, AiTaggingService> = {
  anthropic: AnthropicService,
  google: GoogleService,
};

/**
 * The configured AI tagging provider, or null when the feature is off. Provider
 * selection lives in ./config (pickProvider) so it is shared with the facet
 * classifier and the page-level feature check rather than duplicated.
 */
export function getAiTaggingService(): AiTaggingService | null {
  const provider = pickProvider();
  return provider ? SERVICES[provider] : null;
}
