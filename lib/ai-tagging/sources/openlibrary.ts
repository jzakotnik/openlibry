import { cleanIsbn } from "@/lib/utils/isbn";
import type { SourcedTag } from "../types";

/**
 * International (English) subject candidates from Open Library — the non-German
 * source of truth. Its subjects are LCSH-derived plus community curation and,
 * crucially, cover *fiction* thematically (Witches, Magic, Friendship…) where
 * DNB is silent. Open Library resolves editions to works, so it returns
 * subjects even for German-edition ISBNs. Free, no key. The English terms are
 * translated/normalised to the library's German vocabulary by the LLM reconciler.
 */

const BASE = "https://openlibrary.org/api/books";
const TIMEOUT_MS = 6000;
const MAX_SUBJECTS = 15;

// Drop format/audience/admin facets that aren't themes.
const NOISE = /language materials|large type|reading level|accessible book|^fiction$|^juvenile fiction$|^juvenile literature$/i;

export async function fetchOpenLibraryCandidates(
  isbn: string | undefined | null,
): Promise<SourcedTag[]> {
  const clean = cleanIsbn(isbn);
  if (!clean) return [];

  const url = `${BASE}?bibkeys=ISBN:${clean}&format=json&jscmd=data`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Record<
      string,
      { subjects?: Array<{ name?: string }> }
    >;
    const subjects = data[`ISBN:${clean}`]?.subjects ?? [];

    const seen = new Set<string>();
    const tags: SourcedTag[] = [];
    for (const s of subjects) {
      const name = (s.name ?? "").trim();
      // Drop namespaced facets (series:/place:/person:/time:) and noise.
      if (!name || name.includes(":") || name.length < 3) continue;
      if (NOISE.test(name)) continue;
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      tags.push({ tag: name, source: "openlibrary" });
      if (tags.length >= MAX_SUBJECTS) break;
    }
    return tags;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
