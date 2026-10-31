import type { PrismaClient } from "@prisma/client";
import { cleanIsbn, isbnVariants } from "@/lib/utils/isbn";
import { aggregateTopicCounts } from "../rankTopics";
import type { SourcedTag } from "../types";

/**
 * Library-internal candidates — tags this library has already curated. Two
 * flavours, both provenance "library" (already in the vocabulary, so they
 * reconcile to "existing"/green):
 *
 *  - fetchSameBookCandidates: the strongest signal of all. If another copy of
 *    *this exact book* (same ISBN) is already catalogued WITH tags, reuse them —
 *    they were approved by a human. When no such copy exists (new book) or it
 *    has no tags, this returns nothing and the rest of the pipeline takes over.
 *  - fetchLibraryCandidates: tags from *other books by the same author*. Sequels
 *    and an author's body of work usually share themes.
 */

/** Rank ";"-separated topics by frequency, tagged with "library" provenance. */
function rankTopicRows(rows: Array<{ topics: string | null }>): SourcedTag[] {
  return aggregateTopicCounts(rows).map((v) => ({
    tag: v.canonical,
    source: "library" as const,
  }));
}

/**
 * Tags from other copies of the same book (same ISBN) already catalogued with
 * topics. Highest-confidence source — human-approved tags for the exact title.
 * (Exact ISBN match; ISBN-10/13 variants of the same edition won't cross-match.)
 */
export async function fetchSameBookCandidates(
  prisma: PrismaClient,
  isbn: string | undefined | null,
): Promise<SourcedTag[]> {
  // Match every equivalent ISBN form so an ISBN-10-catalogued copy is found
  // from a scanned ISBN-13 of the same edition (and vice versa).
  const variants = isbnVariants(isbn);
  if (variants.length === 0) return [];
  const rows = await prisma.book.findMany({
    where: { isbn: { in: variants }, topics: { not: null } },
    select: { topics: true },
  });
  return rankTopicRows(rows);
}

/** Tags from other books by the same author (excluding the book being tagged). */
export async function fetchLibraryCandidates(
  prisma: PrismaClient,
  author: string | undefined | null,
  excludeIsbn?: string | null,
): Promise<SourcedTag[]> {
  const a = (author ?? "").trim();
  if (!a) return [];

  const rows = await prisma.book.findMany({
    where: { author: a, topics: { not: null } },
    select: { topics: true, isbn: true },
  });

  const exclude = cleanIsbn(excludeIsbn);
  return rankTopicRows(
    rows.filter((r) => !exclude || cleanIsbn(r.isbn) !== exclude),
  );
}
