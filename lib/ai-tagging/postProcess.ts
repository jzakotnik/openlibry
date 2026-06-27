import type { RankedTag, TagSuggestion } from "./types";

/**
 * Deterministic guardrails applied to raw model output, independent of the
 * provider. This is the "semi-deterministic" half of the feature: whatever
 * the model returns, the result is normalized, deduped, snapped onto the
 * canonical existing spelling when it matches the vocabulary (so casing/typos
 * don't fork the tag list), flagged new otherwise, and capped — preferring
 * existing tags over new ones when the cap bites.
 */
export function postProcessTags(
  rawTags: string[],
  vocabulary: RankedTag[],
  maxTags: number,
): TagSuggestion[] {
  const canonicalByLower = new Map<string, string>();
  for (const v of vocabulary) {
    canonicalByLower.set(v.tag.toLowerCase(), v.tag);
  }

  const seen = new Set<string>();
  const existing: TagSuggestion[] = [];
  const fresh: TagSuggestion[] = [];

  for (const raw of rawTags) {
    const trimmed = (raw ?? "").trim().replace(/\s+/g, " ");
    if (!trimmed) continue;
    // Tags are stored ";"-separated — a literal ";" inside a tag would corrupt
    // the field, so drop it defensively.
    if (trimmed.includes(";")) continue;

    const lower = trimmed.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);

    const canonical = canonicalByLower.get(lower);
    if (canonical) {
      existing.push({ tag: canonical, isNew: false });
    } else {
      fresh.push({ tag: trimmed, isNew: true });
    }
  }

  return [...existing, ...fresh].slice(0, Math.max(0, maxTags));
}
