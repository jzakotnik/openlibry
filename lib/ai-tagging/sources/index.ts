import type { PrismaClient } from "@prisma/client";
import type { BookTagInput, SourcedTag } from "../types";
import { fetchDnbCandidates } from "./dnb";
import { fetchLibraryCandidates, fetchSameBookCandidates } from "./library";
import { fetchOpenLibraryCandidates } from "./openlibrary";
import { fetchWikidataCandidates } from "./wikidata";

export { fetchDnbCandidates } from "./dnb";
export { fetchLibraryCandidates, fetchSameBookCandidates } from "./library";
export { fetchOpenLibraryCandidates } from "./openlibrary";
export { fetchWikidataCandidates } from "./wikidata";

// Lower wins when the same tag surfaces from several sources. Library tags are
// preferred (already in this library's vocabulary); DNB is the most
// authoritative cataloguing source; Open Library and Wikidata round out the
// international/fiction coverage.
const SOURCE_PRIORITY: Record<SourcedTag["source"], number> = {
  dnb: 0,
  library: 1,
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
    fetchDnbCandidates(book.isbn),
    fetchLibraryCandidates(prisma, book.author, book.isbn),
    fetchOpenLibraryCandidates(book.isbn),
    fetchWikidataCandidates(book.title),
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
