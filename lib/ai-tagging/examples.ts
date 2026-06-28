import type { PrismaClient } from "@prisma/client";
import { cleanIsbn } from "@/lib/utils/isbn";
import { sanitizeTopicList } from "./prompt";
import type { BookTagInput, SourcedTag, TagExample } from "./types";

/**
 * Retrieval-augmented few-shot examples. A flat vocabulary list tells the model
 * which tag words are legal; it does not show HOW this library applies them
 * (granularity, which tags co-occur, the library's idiosyncratic tags). Showing
 * a handful of similar already-tagged books as "title → tags" demonstrations
 * teaches that mapping — the same thing that makes "paste the whole catalogue"
 * work, but bounded to the relevant neighbours.
 */

export interface CorpusBook {
  title: string;
  author: string | null;
  isbn: string | null;
  tags: string[];
}

const AUTHOR_EXAMPLES = 3; // strongest signal — reserve a few slots
const TOTAL_EXAMPLES = 6;

/** Load every already-tagged book once, as few-shot example material. */
export async function loadTaggedCorpus(
  prisma: PrismaClient,
): Promise<CorpusBook[]> {
  const rows = await prisma.book.findMany({
    where: { topics: { not: null } },
    select: { title: true, author: true, isbn: true, topics: true },
  });
  const corpus: CorpusBook[] = [];
  for (const r of rows) {
    const tags = sanitizeTopicList(r.topics);
    if (!r.title || tags.length === 0) continue;
    corpus.push({ title: r.title, author: r.author, isbn: r.isbn, tags });
  }
  return corpus;
}

/**
 * Pick the most relevant already-tagged books to demonstrate to the model.
 * Same-author books lead (sequels/an author's body of work share themes); the
 * rest are filled by tag overlap with the grounded candidates and the book's
 * own (sanitized) topics, so a poetry book retrieves other tagged poetry books.
 * The book being tagged is excluded so it can't echo itself.
 */
export function selectExamples(
  corpus: CorpusBook[],
  book: BookTagInput,
  candidates: SourcedTag[],
  limit = TOTAL_EXAMPLES,
): TagExample[] {
  const selfIsbn = cleanIsbn(book.isbn);
  const selfTitle = (book.title ?? "").trim().toLowerCase();
  const selfAuthor = (book.author ?? "").trim().toLowerCase();

  const seeds = new Set<string>();
  for (const c of candidates) seeds.add(c.tag.toLowerCase());
  for (const t of sanitizeTopicList(book.topics)) seeds.add(t.toLowerCase());

  const isSelf = (b: CorpusBook) =>
    (!!selfIsbn && cleanIsbn(b.isbn) === selfIsbn) ||
    (b.title.trim().toLowerCase() === selfTitle &&
      (b.author ?? "").trim().toLowerCase() === selfAuthor);

  const seenKeys = new Set<string>();
  const take = (b: CorpusBook): boolean => {
    const key =
      b.title.trim().toLowerCase() + "|" + (b.author ?? "").trim().toLowerCase();
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  };

  const pool = corpus.filter((b) => !isSelf(b));
  const toExample = (b: CorpusBook): TagExample => ({
    title: b.title,
    author: b.author ?? undefined,
    tags: b.tags,
  });

  // Same-author examples first.
  const authorMatches = selfAuthor
    ? pool.filter((b) => (b.author ?? "").trim().toLowerCase() === selfAuthor)
    : [];

  // Tag-overlap examples, scored by how many of their tags hit the seed set.
  const overlap = pool
    .map((b) => ({
      b,
      score: b.tags.reduce((n, t) => n + (seeds.has(t.toLowerCase()) ? 1 : 0), 0),
    }))
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score);

  const out: TagExample[] = [];
  for (const b of authorMatches) {
    if (out.length >= Math.min(AUTHOR_EXAMPLES, limit)) break;
    if (take(b)) out.push(toExample(b));
  }
  for (const { b } of overlap) {
    if (out.length >= limit) break;
    if (take(b)) out.push(toExample(b));
  }
  return out;
}
