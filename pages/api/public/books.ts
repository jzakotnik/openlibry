import { PublicBookType } from "@/entities/PublicBookType";
import { prisma, reconnectPrisma } from "@/entities/db";
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";
import type { NextApiRequest, NextApiResponse } from "next";

type ErrorData = {
  result: string;
};

/**
 * GET /api/public/books
 *
 * Unauthenticated endpoint returning a curated subset of book data suitable
 * for a public-facing catalog. Security properties:
 *
 *  - Only whitelisted fields are fetched via Prisma `select` — the user
 *    relation and all PII-adjacent fields are never retrieved from the DB.
 *  - `rentalStatus` is safe to expose: it is "available" or "rented" only,
 *    with no reference to which user has the book.
 *  - `coverUrl` is derived from the book ID pointing to /api/images/[id],
 *    which is already excluded from auth in middleware.ts.
 *  - Strictly GET-only; all other methods are rejected with 405.
 *  - No mutations are possible through this route.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Array<PublicBookType> | ErrorData>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end(`${req.method} Not Allowed`);
  }

  // Public read-only endpoint: allow moderate caching.
  // 60s browser cache, 5min CDN/proxy cache.
  if (process.env.NODE_ENV !== "production") {
    await reconnectPrisma();
  }

  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");

  try {
    const rawBooks = await prisma.book.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        isbn: true,
        topics: true,
        rentalStatus: true,
      },
      orderBy: { title: "asc" },
    });

    const books: Array<PublicBookType> = rawBooks.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      isbn: b.isbn,
      topics: b.topics,
      rentalStatus: b.rentalStatus,
      // Cover is served by /api/images/[id], which handles the .jpg lookup
      // and default.jpg fallback. That route is already excluded from auth
      // in middleware.ts so unauthenticated clients can fetch it directly.
      coverUrl: `/api/images/${b.id}`,
    }));

    businessLogger.info(
      {
        event: LogEvents.BOOK_LIST_FETCHED,
        count: books.length,
        endpoint: "/api/public/books",
      },
      "Public book catalog fetched",
    );

    return res.status(200).json(books);
  } catch (error) {
    errorLogger.error(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/public/books",
        method: "GET",
        error: error instanceof Error ? error.message : String(error),
      },
      "Error fetching public book catalog",
    );
    return res.status(500).json({ result: "ERROR: " + error });
  }
}
