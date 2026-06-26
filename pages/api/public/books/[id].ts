import { PublicBookDetailType } from "@/entities/PublicBookDetailType";
import { PublicBookType } from "@/entities/PublicBookType";
import { prisma, reconnectPrisma } from "@/entities/db";
import { LogEvents } from "@/lib/logEvents";
import { errorLogger } from "@/lib/logger";
import type { NextApiRequest, NextApiResponse } from "next";

const RELATED_LIMIT = 6;

function parseTopics(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw.split(";").map((t) => t.trim()).filter(Boolean);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PublicBookDetailType | { result: string }>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end(`${req.method} Not Allowed`);
  }

  const id = parseInt(req.query.id as string, 10);
  if (isNaN(id)) {
    return res.status(400).json({ result: "Invalid book ID" });
  }

  if (process.env.NODE_ENV !== "production") {
    await reconnectPrisma();
  }

  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");

  try {
    const book = await prisma.book.findUnique({
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

    if (!book) {
      return res.status(404).json({ result: "Book not found" });
    }

    const topics = parseTopics(book.topics);

    let relatedBooks: PublicBookType[] = [];
    if (topics.length > 0) {
      const candidates = await prisma.book.findMany({
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

    const detail: PublicBookDetailType = {
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

    return res.status(200).json(detail);
  } catch (error) {
    errorLogger.error(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/public/books/[id]",
        method: "GET",
        bookId: id,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error fetching public book detail",
    );
    return res.status(500).json({ result: "ERROR: " + error });
  }
}
