import type { RankedTag, SourcedTag, TagSuggestion } from "./types";

/**
 * Deterministic reconciliation of the LLM's chosen tags against the library
 * vocabulary and the grounded source candidates. This is where provenance is
 * assigned and the "existing first" cap is enforced — the model picks/normalizes,
 * but the final shape is decided here, reproducibly.
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
): TagSuggestion[] {
  const canonicalByLower = new Map<string, string>();
  for (const v of vocabulary) canonicalByLower.set(v.tag.toLowerCase(), v.tag);

  const sourceByLower = new Map<string, SourcedTag["source"]>();
  for (const s of sourced) {
    if (!sourceByLower.has(s.tag.toLowerCase())) {
      sourceByLower.set(s.tag.toLowerCase(), s.source);
    }
  }

  const seen = new Set<string>();
  const existing: TagSuggestion[] = [];
  const fresh: TagSuggestion[] = [];

  for (const raw of rawTags) {
    const trimmed = (raw ?? "").trim().replace(/\s+/g, " ");
    if (!trimmed || trimmed.includes(";")) continue; // ";" would corrupt the field
    const lower = trimmed.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);

    const canonical = canonicalByLower.get(lower);
    const sourcedFrom = sourceByLower.get(lower);

    if (canonical) {
      existing.push({
        tag: canonical,
        isNew: false,
        source: sourcedFrom ?? "library",
      });
    } else {
      fresh.push({
        tag: trimmed,
        isNew: true,
        source: sourcedFrom ?? "ai",
      });
    }
  }

  // Existing (already-controlled) tags fill the slots first; new tags only if
  // there is room left.
  return [...existing, ...fresh].slice(0, Math.max(0, maxTags));
}
