import { PublicBookDetailType } from "@/entities/PublicBookDetailType";
import { PublicBookType } from "@/entities/PublicBookType";
import { Prisma, PrismaClient } from "@prisma/client";

const RELATED_LIMIT = 5;
// Bound on rows fetched for related-book ranking. Ranking beyond this many
// candidates is approximate, which is acceptable for a 5-item suggestion list.
const RELATED_CANDIDATE_LIMIT = 200;

/**
 * The Prisma `select` counterpart of PublicBookType: the only book fields that
 * may be fetched for unauthenticated responses. Keep in sync with that type.
 */
export const PUBLIC_BOOK_SELECT = {
  id: true,
  title: true,
  author: true,
  isbn: true,
  topics: true,
  rentalStatus: true,
} satisfies Prisma.BookSelect;

type PublicBookRow = Prisma.BookGetPayload<{ select: typeof PUBLIC_BOOK_SELECT }>;

export function toPublicBook(b: PublicBookRow): PublicBookType {
  return {
    id: b.id,
    title: b.title,
    author: b.author,
    isbn: b.isbn,
    topics: b.topics,
    rentalStatus: b.rentalStatus,
    coverUrl: `/api/images/${b.id}`,
  };
}

export function parseTopics(raw: string | null | undefined): string[] {
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
      ...PUBLIC_BOOK_SELECT,
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
        OR: topics.map((topic) => ({ topics: { contains: topic } })),
      },
      select: PUBLIC_BOOK_SELECT,
      take: RELATED_CANDIDATE_LIMIT,
    });

    relatedBooks = candidates
      .map((b) => ({
        book: b,
        shared: parseTopics(b.topics).filter((t) => topics.includes(t)).length,
      }))
      .sort((a, b) => b.shared - a.shared)
      .slice(0, RELATED_LIMIT)
      .map(({ book: b }) => toPublicBook(b));
  }

  return {
    ...toPublicBook(book),
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
