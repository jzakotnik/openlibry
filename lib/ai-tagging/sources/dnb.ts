import { cleanIsbn } from "@/lib/utils/isbn";
import type { SourcedTag } from "../types";

/**
 * Authoritative subject candidates from the Deutsche Nationalbibliothek (DNB).
 *
 * Uses the public SRU endpoint with the Dublin Core schema, whose <dc:subject>
 * elements are already human-readable — DDC subject groups come prefixed with
 * their number ("100 Philosophie") and GND Schlagwörter come as plain terms.
 * No key required. Deterministic: same ISBN → same record.
 *
 * Coverage note: DNB indexes non-fiction richly but frequently leaves fiction /
 * children's books without subjects — callers must treat an empty result as
 * normal and fall back to other sources (author/series, Wikidata, LLM).
 */

const SRU_BASE = "https://services.dnb.de/sru/dnb";
const TIMEOUT_MS = 6000;

/**
 * Generic DNB audience/format labels that classify *what kind of book* it is
 * rather than what it's *about* — useless as theme tags (every children's book
 * carries "Kinder- und Jugendliteratur"). Dropped.
 */
const GENERIC_LABELS = new Set([
  "kinder- und jugendliteratur",
  "belletristik",
  "fiktionale darstellung",
  "belletristische darstellung",
]);

/** Strip leading DDC numbers ("100 Philosophie") and DNB-Sachgruppe letter
 *  codes ("K Kinder- und Jugendliteratur") down to the bare label. */
function cleanSubject(raw: string): string {
  return raw
    .replace(/^\s*[\d.]+\s+/, "") // leading DDC number
    .replace(/^\s*[A-Z]\s+/, "") // leading sdnb letter code (B, K, …)
    .replace(/\s*\/\s*$/, "")
    .trim();
}

function extractSubjects(xml: string): string[] {
  const out: string[] = [];
  const re = /<dc:subject[^>]*>([\s\S]*?)<\/dc:subject>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const decoded = m[1]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#\d+;/g, " ");
    const cleaned = cleanSubject(decoded);
    // Drop bare letter codes and generic audience/format labels (keep themes).
    if (
      cleaned.length >= 3 &&
      !/^[A-Z]$/.test(cleaned) &&
      !GENERIC_LABELS.has(cleaned.toLowerCase())
    ) {
      out.push(cleaned);
    }
  }
  return out;
}

/**
 * Fetches DNB subject candidates for an ISBN. Returns [] on any failure (network,
 * timeout, no record) — tagging must never break because an external catalog is
 * slow or down.
 */
export async function fetchDnbCandidates(
  isbn: string | undefined | null,
): Promise<SourcedTag[]> {
  const clean = cleanIsbn(isbn);
  if (!clean) return [];

  const url =
    `${SRU_BASE}?version=1.1&operation=searchRetrieve` +
    `&query=ISBN%3D${clean}&recordSchema=oai_dc&maximumRecords=1`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return [];
    const xml = await res.text();

    const seen = new Set<string>();
    const tags: SourcedTag[] = [];
    for (const subject of extractSubjects(xml)) {
      const key = subject.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      tags.push({ tag: subject, source: "dnb" });
    }
    return tags;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
