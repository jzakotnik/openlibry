import type { Facet } from "./config";
import type { RankedTag, SourcedTag, TagSuggestion } from "./types";

/**
 * Deterministic reconciliation of the LLM's chosen tags against the library
 * vocabulary and the grounded source candidates. This is where provenance is
 * assigned and the evidence-tier ordering + cap are enforced — the model
 * picks/normalizes, but the final shape is decided here, reproducibly. Tags are
 * ranked by how well-grounded they are (see the tier comment below) so the cap
 * sheds the weakest evidence first.
 *
 * Provenance per tag, most-informative first:
 *   - matches a source candidate → that source ("dnb" / "wikidata" / "library")
 *   - else already in the vocabulary → "library" (existing tag)
 *   - else → "ai" (the model normalized or invented it)
 *
 * isNew = not currently in the library vocabulary.
 */
export function reconcileTags(
  rawTags: string[],
  sourced: SourcedTag[],
  vocabulary: RankedTag[],
  maxTags: number,
  /** Bibliographic context for the soft new-tag gate (title/author echo check). */
  context?: { title?: string; author?: string },
  /** Facet classification of the vocabulary (tag spelling → facet), used to
   *  spare place names from the title-echo off-style flag (see below). */
  facetMap?: Record<string, Facet>,
): TagSuggestion[] {
  const canonicalByLower = new Map<string, string>();
  for (const v of vocabulary) canonicalByLower.set(v.tag.toLowerCase(), v.tag);

  const sourceByLower = new Map<string, SourcedTag["source"]>();
  for (const s of sourced) {
    if (!sourceByLower.has(s.tag.toLowerCase())) {
      sourceByLower.set(s.tag.toLowerCase(), s.source);
    }
  }

  const facetByLower = new Map<string, Facet>();
  for (const [tag, facet] of Object.entries(facetMap ?? {})) {
    facetByLower.set(tag.toLowerCase(), facet);
  }

  // Soft style gate (see TagSuggestion.offStyle). A *new* tag is flagged when it
  // looks like a coined proper noun echoing the title/author (e.g. "Michelangelo"
  // for a book titled "Michelangelo"). Matched on WHOLE WORDS, not substrings, so
  // a thematic tag isn't flagged for merely appearing inside a longer title word
  // (e.g. "eis" inside "Reise"). Language-agnostic, no NER. Flagged tags are kept
  // but ranked last, so they survive on a young library (where everything is new)
  // yet don't crowd out controlled tags on a mature one.
  const titleAuthorWords = new Set(
    `${context?.title ?? ""} ${context?.author ?? ""}`
      .toLowerCase()
      .split(/[^a-zà-ÿ0-9]+/)
      .filter(Boolean),
  );
  // Carve-out: a title-echo tag is NOT a coined echo if an external catalogue
  // also returns it (grounded) or the vocabulary classifies it as a place
  // (Region). A book titled "…in Anatolien" legitimately gets the subject tag
  // Anatolien; only an *uncorroborated, non-place* title echo is off-style.
  const isOffStyle = (lower: string): boolean =>
    lower.length >= 3 &&
    titleAuthorWords.has(lower) &&
    !sourceByLower.has(lower) &&
    facetByLower.get(lower) !== "Region";

  // Evidence tiers (lower = stronger). Tags are ordered by tier and the cap then
  // sheds the weakest first, so a model-only guess loses to a grounded tag and a
  // coined echo loses to everything. Within a tier the model's order is kept.
  //   0  existing vocab tag corroborated by a grounded source candidate
  //   1  existing vocab tag implied by the title/author (whole-word)
  //   2  existing vocab tag the model chose on its own (no source, no echo)
  //   3  new on-style tag
  //   4  new off-style tag (coined title/author echo)
  const seen = new Set<string>();
  const scored: Array<TagSuggestion & { tier: number }> = [];

  for (const raw of rawTags) {
    const trimmed = (raw ?? "").trim().replace(/\s+/g, " ");
    if (!trimmed || trimmed.includes(";")) continue; // ";" would corrupt the field
    const lower = trimmed.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);

    const canonical = canonicalByLower.get(lower);
    const sourcedFrom = sourceByLower.get(lower);

    if (canonical) {
      const tier = sourcedFrom ? 0 : titleAuthorWords.has(lower) ? 1 : 2;
      scored.push({
        tag: canonical,
        isNew: false,
        source: sourcedFrom ?? "library",
        tier,
      });
    } else {
      const off = isOffStyle(lower);
      scored.push({
        tag: trimmed,
        isNew: true,
        source: sourcedFrom ?? "ai",
        offStyle: off,
        tier: off ? 4 : 3,
      });
    }
  }

  // Stable sort by tier (Array.prototype.sort is stable), then cap.
  scored.sort((a, b) => a.tier - b.tier);
  return scored
    .slice(0, Math.max(0, maxTags))
    .map(({ tier: _tier, ...s }) => s);
}
