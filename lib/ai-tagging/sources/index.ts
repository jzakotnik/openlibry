import type { PrismaClient } from "@prisma/client";
import { cleanIsbn } from "@/lib/utils/isbn";
import type { BookTagInput, SourcedTag } from "../types";
import { fetchDnbCandidates } from "./dnb";
import { fetchLibraryCandidates, fetchSameBookCandidates } from "./library";
import { memoizeSource } from "./memoize";
import { fetchOpenLibraryCandidates } from "./openlibrary";
import { fetchWikidataCandidates } from "./wikidata";

// External lookups are keyed by stable identifiers (ISBN / title) and cached
// in-process: this dedups duplicate lookups within a batch and across batches.
// The live DB sources (same-book / same-author) are intentionally NOT cached.
const dnbCached = memoizeSource(fetchDnbCandidates, (isbn) => cleanIsbn(isbn));
const openLibraryCached = memoizeSource(fetchOpenLibraryCandidates, (isbn) =>
  cleanIsbn(isbn),
);
// Keyed by title AND author: generic titles ("Sämtliche Gedichte") exist for
// many different authors, and a title-only key would hand one poet's cached
// candidates to every other poet's collected works.
const wikidataCached = memoizeSource(fetchWikidataCandidates, (title, author) => {
  const t = (title ?? "").trim().toLowerCase();
  return t ? `${t}|${(author ?? "").trim().toLowerCase()}` : "";
});

export { fetchDnbCandidates } from "./dnb";
export { fetchLibraryCandidates, fetchSameBookCandidates } from "./library";
export { fetchOpenLibraryCandidates } from "./openlibrary";
export { fetchWikidataCandidates } from "./wikidata";

// Lower wins when the same tag surfaces from several sources. Library tags lead
// (human-approved, already in this library's vocabulary — so the chip shows as
// "existing"); DNB is the most authoritative external cataloguing source; Open
// Library and Wikidata round out the international/fiction coverage.
const SOURCE_PRIORITY: Record<SourcedTag["source"], number> = {
  library: 0,
  dnb: 1,
  openlibrary: 2,
  wikidata: 3,
  ai: 4,
};

/**
 * Gathers authoritative/grounded tag candidates for one book from all external
 * + internal sources in parallel, deduped (case-insensitive) keeping the
 * highest-priority source for provenance. Every source fails soft (returns []),
 * so a slow or down catalog degrades gracefully toward the remaining sources.
 */
export async function gatherSourceCandidates(
  prisma: PrismaClient,
  book: BookTagInput,
): Promise<SourcedTag[]> {
  const [sameBook, dnb, lib, openlib, wiki] = await Promise.all([
    fetchSameBookCandidates(prisma, book.isbn),
    dnbCached(book.isbn),
    fetchLibraryCandidates(prisma, book.author, book.isbn),
    openLibraryCached(book.isbn),
    wikidataCached(book.title, book.author),
  ]);

  // Same-book tags lead — human-approved tags for this exact title.
  const byKey = new Map<string, SourcedTag>();
  for (const t of [...sameBook, ...dnb, ...lib, ...openlib, ...wiki]) {
    const key = t.tag.toLowerCase();
    const existing = byKey.get(key);
    if (!existing || SOURCE_PRIORITY[t.source] < SOURCE_PRIORITY[existing.source]) {
      byKey.set(key, t);
    }
  }
  return [...byKey.values()];
}
