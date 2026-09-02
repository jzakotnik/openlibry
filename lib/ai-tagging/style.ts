import type { CorpusBook } from "./examples";

/**
 * A library's tagging style, learned from its own already-tagged books — never
 * from domain rules. Fed to the model so it matches local conventions
 * (granularity, which facets this library actually uses) rather than tagging in
 * some generic "correct" way. An art library surfaces Epoche/Region/Strömung; a
 * primary-school one surfaces Thema (Freundschaft, Abenteuer, …) — automatically,
 * because the content is the library's own tags.
 */
export interface StyleProfile {
  /** Median number of tags per already-tagged book. 0 when nothing is tagged. */
  typicalTagCount: number;
  /** Facets that appear in a meaningful share of books, most-used first. */
  facetsInUse: string[];
}

/** Facets present on at least this fraction of tagged books count as "in use". */
const FACET_IN_USE_THRESHOLD = 0.15;

export function computeStyleProfile(
  corpus: CorpusBook[],
  facetMap: Record<string, string>,
): StyleProfile {
  const counts = corpus
    .map((b) => b.tags.length)
    .filter((n) => n > 0)
    .sort((a, b) => a - b);
  const typicalTagCount = counts.length
    ? counts[Math.floor(counts.length / 2)]
    : 0;

  const facetLower = new Map<string, string>();
  for (const [tag, facet] of Object.entries(facetMap)) {
    facetLower.set(tag.toLowerCase(), facet);
  }

  // Count, per facet, how many books carry at least one tag of that facet.
  const facetBookCount = new Map<string, number>();
  for (const b of corpus) {
    const seen = new Set<string>();
    for (const t of b.tags) {
      const facet = facetLower.get(t.toLowerCase());
      if (facet && !seen.has(facet)) {
        seen.add(facet);
        facetBookCount.set(facet, (facetBookCount.get(facet) ?? 0) + 1);
      }
    }
  }

  const total = corpus.length || 1;
  const facetsInUse = [...facetBookCount.entries()]
    .filter(([, n]) => n / total >= FACET_IN_USE_THRESHOLD)
    .sort((a, b) => b[1] - a[1])
    .map(([facet]) => facet);

  return { typicalTagCount, facetsInUse };
}

/** German prompt block describing the style; "" when there's nothing to say. */
export function renderStyleProfile(p: StyleProfile): string {
  if (p.typicalTagCount <= 0 && p.facetsInUse.length === 0) return "";
  const lines = ["Stil dieser Bibliothek (an diesem Stil orientieren):"];
  if (p.typicalTagCount > 0) {
    lines.push(
      `- Diese Bibliothek vergibt meist etwa ${p.typicalTagCount} Schlagwörter ` +
        "pro Buch. Das ist nur ein Richtwert gegen Füll-Schlagwörter, KEINE " +
        "Obergrenze: vergib trotzdem ALLE eindeutig passenden Schlagwörter, " +
        "auch wenn es mehr werden — lass nur unsichere oder fast " +
        "bedeutungsgleiche weg.",
    );
  }
  if (p.facetsInUse.length > 0) {
    lines.push(`- Übliche Arten von Schlagwörtern: ${p.facetsInUse.join(", ")}.`);
  }
  lines.push(
    "- Übernimm Körnung, Sprache und Schreibweise der vorhandenen Schlagwörter.",
  );
  return lines.join("\n");
}
