import type { SourcedTag } from "../types";

/**
 * Genre / subject candidates from Wikidata — the source that best covers
 * *fiction*, where DNB usually has nothing.
 *
 * Matched by exact German title constrained to literary works (P31/P279* of
 * Q7725634), which is essential: an unconstrained title match conflates a book
 * with its film/game of the same name (Harry Potter → "Fantasyfilm"). When an
 * author is known, works are additionally required to have a matching author
 * (P50 label containing the surname) — generic titles ("Sämtliche Gedichte")
 * otherwise merge candidates from every poet's collected works into one pot.
 * Works without any author statement are kept, so anthologies still resolve.
 * Reads genre (P136) and main subject (P921). Best-effort: only well-known
 * titles with an exact label resolve, but those are exactly the ones worth
 * grounding.
 */

const WDQS = "https://query.wikidata.org/sparql";
const TIMEOUT_MS = 7000;
// WDQS policy requires a descriptive User-Agent.
const USER_AGENT = "OpenLibry-AITagging/1.0 (library cataloguing assistant)";

/** Escape a literal for embedding inside a SPARQL double-quoted string. */
function sparqlString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[\r\n\t]/g, " ");
}

/**
 * The author's surname, for the SPARQL author filter. Handles the catalogue
 * shapes OpenLibry actually stores: "Goethe, Johann Wolfgang von" (surname
 * before the comma) and "Johann Wolfgang von Goethe" (surname last); multiple
 * authors take the first. Returns "" (no filter) for missing/too-short names,
 * so initials can't over-filter.
 */
export function authorSurname(author: string | undefined | null): string {
  const first = (author ?? "").split(";")[0].trim();
  if (!first) return "";
  const comma = first.indexOf(",");
  const part = comma >= 0 ? first.slice(0, comma) : (first.split(/\s+/).pop() ?? "");
  const s = part.trim();
  return s.length >= 3 ? s : "";
}

export async function fetchWikidataCandidates(
  title: string | undefined | null,
  author?: string | null,
): Promise<SourcedTag[]> {
  const t = (title ?? "").trim();
  if (t.length < 3) return [];

  // Author constraint: keep works whose author label contains the surname, and
  // works with no author statement at all (anthologies). A work by a DIFFERENT
  // author is excluded — that's the point.
  const surname = authorSurname(author).toLowerCase();
  const authorFilter = surname
    ? `OPTIONAL { ?w wdt:P50/rdfs:label ?aLabel . }
    FILTER(!BOUND(?aLabel) || CONTAINS(LCASE(STR(?aLabel)), "${sparqlString(surname)}"))`
    : "";

  const query = `SELECT DISTINCT ?tLabel WHERE {
    ?w rdfs:label "${sparqlString(t)}"@de .
    ?w wdt:P31/wdt:P279* wd:Q7725634 .
    ${authorFilter}
    { ?w wdt:P136 ?t. } UNION { ?w wdt:P921 ?t. }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". }
  } LIMIT 30`;

  const url = `${WDQS}?format=json&query=${encodeURIComponent(query)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/sparql-results+json",
        "User-Agent": USER_AGENT,
      },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      results?: { bindings?: Array<{ tLabel?: { value?: string } }> };
    };

    const seen = new Set<string>();
    const tags: SourcedTag[] = [];
    for (const b of data.results?.bindings ?? []) {
      const label = b.tLabel?.value?.trim();
      if (!label || label.length < 3) continue;
      const key = label.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      tags.push({ tag: label, source: "wikidata" });
    }
    return tags;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
