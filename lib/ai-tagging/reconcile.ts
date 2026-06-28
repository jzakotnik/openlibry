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
  /** Bibliographic context for the soft new-tag gate (title/author echo check). */
  context?: { title?: string; author?: string },
): TagSuggestion[] {
  const canonicalByLower = new Map<string, string>();
  for (const v of vocabulary) canonicalByLower.set(v.tag.toLowerCase(), v.tag);

  const sourceByLower = new Map<string, SourcedTag["source"]>();
  for (const s of sourced) {
    if (!sourceByLower.has(s.tag.toLowerCase())) {
      sourceByLower.set(s.tag.toLowerCase(), s.source);
    }
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
  const isOffStyle = (lower: string): boolean =>
    lower.length >= 3 && titleAuthorWords.has(lower);

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
        offStyle: isOffStyle(lower),
      });
    }
  }

  // Existing (controlled) tags first, then on-style new tags, then off-style
  // new tags. The cap therefore sheds off-style tags first. Stable within groups.
  const freshRanked = fresh.sort(
    (a, b) => Number(a.offStyle ?? false) - Number(b.offStyle ?? false),
  );
  return [...existing, ...freshRanked].slice(0, Math.max(0, maxTags));
}
