import { PublicBookDetailType } from "@/entities/PublicBookDetailType";
import { PublicBookType } from "@/entities/PublicBookType";
import { PrismaClient } from "@prisma/client";

const RELATED_LIMIT = 5;

/**
 * Matches one whole topic inside the ";"-separated topics column.
 *
 * A plain `contains` matches anywhere in the joined string, so "Kunst" also
 * hits everything tagged "Kunstgeschichte". Those carry no shared topic and
 * were dropped afterwards, but they were fetched first, and with the row cap
 * below they could crowd genuine matches out of the query entirely. Anchoring
 * on the separators means the rows that come back are the ones that count.
 * Both separator spellings are listed because counting trims each entry, so
 * "Abenteuer; Freundschaft" advertises Freundschaft.
 */
function topicMatch(topic: string) {
  const separators = [";", "; "];
  const variants: Array<Record<string, unknown>> = [{ topics: topic }];
  for (const sep of separators) {
    variants.push(
      { topics: { startsWith: `${topic};` } },
      { topics: { endsWith: `${sep}${topic}` } },
      { topics: { contains: `${sep}${topic};` } },
      { topics: { contains: `${sep}${topic}; ` } },
    );
  }
  return { OR: variants };
}
// A ceiling on the rows a single detail view will pull in. A topic like
// "Roman" can otherwise match most of the library, all of it read into memory
// to fill five slots on a public page.
const RELATED_CANDIDATE_LIMIT = 500;

function parseTopics(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(";")
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Public detail view for a single book, plus a few related books that share
 * topics. Returns null when the book does not exist.
 *
 * Whitelisted `select` only (see PublicBookType) so no PII-adjacent field can
 * leak. Shared by the API route (/api/public/books/[id]) and the catalog detail
 * page's getServerSideProps, so the page reads the DB directly instead of making
 * an HTTP round-trip to its own API (which breaks under HTTPS and is slower).
 */
export async function getPublicBookDetail(
  client: PrismaClient,
  id: number,
): Promise<PublicBookDetailType | null> {
  const book = await client.book.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      author: true,
      isbn: true,
      topics: true,
      rentalStatus: true,
      subtitle: true,
      summary: true,
      publisherName: true,
      publisherDate: true,
      pages: true,
      minAge: true,
      maxAge: true,
    },
  });

  if (!book) return null;

  const topics = parseTopics(book.topics);

  let relatedBooks: PublicBookType[] = [];
  if (topics.length > 0) {
    const candidates = await client.book.findMany({
      where: {
        id: { not: id },
        OR: topics.map(topicMatch),
      },
      select: {
        id: true,
        title: true,
        author: true,
        isbn: true,
        topics: true,
        rentalStatus: true,
      },
      take: RELATED_CANDIDATE_LIMIT,
    });

    const isbn = book.isbn?.trim();
    const titleAuthor = `${book.title ?? ""}|${book.author ?? ""}`.toLowerCase();

    // Another copy of the same book is not a related book.
    const isSameBook = (b: (typeof candidates)[number]) =>
      isbn
        ? b.isbn?.trim() === isbn
        : `${b.title ?? ""}|${b.author ?? ""}`.toLowerCase() === titleAuthor;

    // One entry per title. Copies of another book share its ISBN and all its
    // topics, so five copies of one title could take all five slots and the
    // list read as a single recommendation repeated.
    const bestPerTitle = new Map<
      string,
      { book: (typeof candidates)[number]; shared: number }
    >();
    for (const b of candidates) {
      if (isSameBook(b)) continue;
      const shared = parseTopics(b.topics).filter((t) =>
        topics.includes(t),
      ).length;
      if (shared === 0) continue;
      const key = b.isbn?.trim()
        ? `i:${b.isbn.trim()}`
        : `t:${(b.title ?? "").trim().toLowerCase()}|${(b.author ?? "")
            .trim()
            .toLowerCase()}`;
      const existing = bestPerTitle.get(key);
      if (!existing || shared > existing.shared) {
        bestPerTitle.set(key, { book: b, shared });
      }
    }

    relatedBooks = [...bestPerTitle.values()]
      .sort((a, b) => b.shared - a.shared)
      .slice(0, RELATED_LIMIT)
      .map(({ book: b }) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        topics: b.topics,
        rentalStatus: b.rentalStatus,
        coverUrl: `/api/images/${b.id}`,
      }));
  }

  return {
    id: book.id,
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    topics: book.topics,
    rentalStatus: book.rentalStatus,
    coverUrl: `/api/images/${book.id}`,
    subtitle: book.subtitle,
    summary: book.summary,
    publisherName: book.publisherName,
    publisherDate: book.publisherDate,
    pages: book.pages,
    minAge: book.minAge,
    maxAge: book.maxAge,
    relatedBooks,
  };
}
