/**
 * FillBookByIsbn API Handler
 *
 * Main entry point for ISBN lookup. Queries multiple external sources
 * in a cascading fallback pattern until book data is found.
 *
 * Usage: GET /api/books/fillBookByIsbn?isbn=978-3-548-06923-4
 */

import type { IsbnLookupService } from "@/lib/isbn-services/types";
import {
  cleanTitle,
  extractPageNumber,
  isValidBookData,
} from "@/lib/isbn-services/types";
import type { NextApiRequest, NextApiResponse } from "next";

import { DnbScrapingService } from "@/lib/isbn-services/DnbScrapingService";
import { DnbSruService } from "@/lib/isbn-services/DnbSruService";
import { GoogleBooksService } from "@/lib/isbn-services/GoogleBooksService";
import { IsbnSearchService } from "@/lib/isbn-services/IsbnSearchService";
import { OpenLibraryService } from "@/lib/isbn-services/OpenLibraryService";
import logger from "@/lib/logger";
/**
 * Ordered list of services to try.
 * Add, remove, or reorder services here to change lookup behavior.
 */
const SERVICES: IsbnLookupService[] = [
  DnbSruService, // 1. DNB SRU API - best for German books
  GoogleBooksService, // 2. Google Books - good international coverage
  OpenLibraryService, // 3. Open Library - free, open source
  IsbnSearchService, // 4. ISBNSearch.org - web scraping fallback
  DnbScrapingService, // 5. DNB Portal - last resort for German books
];

/**
 * API Handler
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { isbn } = req.query;

  if (!isbn || typeof isbn !== "string") {
    res.status(400).json({ error: "Missing ISBN parameter" });
    return;
  }

  try {
    // Try each service in order until we get valid data
    for (const service of SERVICES) {
      logger.debug(
        {
          category: "business",
          event: "isbn.lookup.trying",
          isbn,
          service: service.name,
        },
        `Trying ${service.name} for ISBN ${isbn}`
      );

      const bookData = await service.fetch(isbn);

      if (isValidBookData(bookData)) {
        // Normalize data before returning
        const pagesNum = extractPageNumber(bookData.pages);
        const normalizedData = {
          ...bookData,
          title: cleanTitle(bookData.title),
          subtitle: cleanTitle(bookData.subtitle),
          pages: pagesNum ? pagesNum : null,
          _source: service.name, // Include source for debugging
        };

        logger.debug(
          {
            category: "business",
            event: "isbn.lookup.found",
            isbn,
            service: service.name,
            title: normalizedData.title,
          },
          `Found via ${service.name}: ${normalizedData.title}`
        );

        res.status(200).json(normalizedData);
        return;
      }

      logger.debug(
        {
          category: "business",
          event: "isbn.lookup.notfound",
          isbn,
          service: service.name,
        },
        `No results from ${service.name}`
      );
    }

    // No results from any service
    const serviceNames = SERVICES.map((s) => s.name).join(", ");
    logger.info(
      {
        category: "business",
        event: "isbn.lookup.failed",
        isbn,
        services: serviceNames,
      },
      `Book not found in any catalog for ISBN ${isbn}`
    );
    res.status(404).json({
      error: `Book not found in any catalog (${serviceNames}).`,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logger.error(
      {
        category: "error",
        event: "isbn.lookup.error",
        isbn,
        error: errorMessage,
      },
      `Unexpected error during ISBN lookup: ${errorMessage}`
    );
    res.status(500).json({
      error: errorMessage || "Error fetching book data.",
    });
  }
}
