import { getPagedPublicBooks, getPublicBooks, PagedPublicBooks } from "@/entities/book";
import { prisma, reconnectPrisma } from "@/entities/db";
import { PublicBookType } from "@/entities/PublicBookType";
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";
import type { NextApiRequest, NextApiResponse } from "next";

type ErrorData = {
  result: string;
};

function getSingleQueryValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getPositiveInt(value: string | string[] | undefined): number | null {
  const parsed = parseInt(getSingleQueryValue(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * GET /api/public/books
 *
 * Unauthenticated endpoint returning a curated subset of book data suitable
 * for a public-facing catalog. Field whitelisting now lives in
 * entities/book.ts::getPublicBooks so this route and getServerSideProps in
 * pages/catalog/index.tsx share one implementation instead of the page
 * re-fetching this route over HTTP.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Array<PublicBookType> | PagedPublicBooks | ErrorData>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end(`${req.method} Not Allowed`);
  }

  if (process.env.NODE_ENV !== "production") {
    await reconnectPrisma();
  }

  // Public read-only endpoint: allow moderate caching.
  // 60s browser cache, 5min CDN/proxy cache.
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");

  try {
    const pageSize = getPositiveInt(req.query.pageSize);
    const page = getPositiveInt(req.query.page) ?? 1;
    const q = getSingleQueryValue(req.query.q);

    if (pageSize) {
      const result = await getPagedPublicBooks(prisma, {
        page,
        pageSize,
        query: q,
      });

      businessLogger.info(
        {
          event: LogEvents.BOOK_LIST_FETCHED,
          count: result.books.length,
          total: result.total,
          endpoint: "/api/public/books",
          paged: true,
        },
        "Public book catalog fetched",
      );

      return res.status(200).json(result);
    }

    const books = await getPublicBooks(prisma);

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
