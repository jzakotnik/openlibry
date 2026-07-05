import { PublicBookDetailType } from "@/entities/PublicBookDetailType";
import { PublicBookType } from "@/entities/PublicBookType";
import { PrismaClient } from "@prisma/client";

const RELATED_LIMIT = 5;

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
        OR: topics.map((topic) => ({ topics: { contains: topic } })),
      },
      select: {
        id: true,
        title: true,
        author: true,
        isbn: true,
        topics: true,
        rentalStatus: true,
      },
    });

    relatedBooks = candidates
      .map((b) => ({
        book: b,
        shared: parseTopics(b.topics).filter((t) => topics.includes(t)).length,
      }))
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
