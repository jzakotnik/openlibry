import type { IsbnLookupService } from "@/lib/isbn-services/types";
import {
  cleanTitle,
  extractPageNumber,
  isValidBookData,
} from "@/lib/isbn-services/types";
import type { NextApiRequest, NextApiResponse } from "next";

import { t } from "@/lib/i18n";
import { DnbScrapingService } from "@/lib/isbn-services/DnbScrapingService";
import { DnbSruService } from "@/lib/isbn-services/DnbSruService";
import { GoogleBooksService } from "@/lib/isbn-services/GoogleBooksService";
import { IsbnSearchService } from "@/lib/isbn-services/IsbnSearchService";
import { OpenLibraryService } from "@/lib/isbn-services/OpenLibraryService";
import logger from "@/lib/logger";

const SERVICES: IsbnLookupService[] = [
  DnbSruService,
  GoogleBooksService,
  OpenLibraryService,
  IsbnSearchService,
  DnbScrapingService,
];

// Built once at module load — locale is fixed per deployment.
// Same pattern as errorMessages in error.tsx and CONFIG_SECTIONS in settings.tsx.
const i18n = {
  error: {
    missingParam: t("isbnLookup.error.missingParam"),
    allServicesFailed: t("isbnLookup.error.allServicesFailed"),
    partialFailure: t("isbnLookup.error.partialFailure"),
    notFound: t("isbnLookup.error.notFound"),
    unexpected: t("isbnLookup.error.unexpected"),
  },
  fetchError: {
    timeout: t("isbnLookup.fetchError.timeout"),
    connectionRefused: t("isbnLookup.fetchError.connectionRefused"),
    dnsError: t("isbnLookup.fetchError.dnsError"),
    connectionReset: t("isbnLookup.fetchError.connectionReset"),
    tlsError: t("isbnLookup.fetchError.tlsError"),
    networkError: t("isbnLookup.fetchError.networkError"),
    unknown: t("isbnLookup.fetchError.unknown"),
  },
};

type ServiceOutcome =
  | { service: string; status: "found" }
  | { service: string; status: "empty" }
  | { service: string; status: "error"; reason: string };

/**
 * Maps raw fetch/network errors to translated, user-reportable reasons.
 * These appear in the `details` array of non-200 responses, so they must be
 * short enough for a librarian to copy-paste into a support message.
 */
function classifyFetchError(err: unknown): string {
  if (!(err instanceof Error)) return i18n.fetchError.unknown;

  const name = err.name;
  const msg = err.message.toLowerCase();

  if (name === "AbortError" || msg.includes("abort") || msg.includes("timeout"))
    return i18n.fetchError.timeout;
  if (msg.includes("econnrefused")) return i18n.fetchError.connectionRefused;
  if (msg.includes("enotfound") || msg.includes("getaddrinfo"))
    return i18n.fetchError.dnsError;
  if (msg.includes("econnreset") || msg.includes("socket hang up"))
    return i18n.fetchError.connectionReset;
  if (msg.includes("certificate") || msg.includes("ssl") || msg.includes("tls"))
    return i18n.fetchError.tlsError;
  if (msg.includes("fetch failed")) return i18n.fetchError.networkError;

  // Raw message as last resort — cap length so it stays readable
  return err.message.slice(0, 120);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { isbn } = req.query;

  if (!isbn || typeof isbn !== "string") {
    return res.status(400).json({ error: i18n.error.missingParam });
  }

  const outcomes: ServiceOutcome[] = [];

  for (const service of SERVICES) {
    logger.debug(
      {
        category: "business",
        event: "isbn.lookup.trying",
        isbn,
        service: service.name,
      },
      `Trying ${service.name} for ISBN ${isbn}`,
    );

    let bookData;
    try {
      bookData = await service.fetch(isbn);
    } catch (err: unknown) {
      const reason = classifyFetchError(err);
      outcomes.push({ service: service.name, status: "error", reason });
      logger.warn(
        {
          category: "business",
          event: "isbn.lookup.service_error",
          isbn,
          service: service.name,
          reason,
        },
        `${service.name} threw an error: ${reason}`,
      );
      continue; // keep trying the remaining services
    }

    if (!isValidBookData(bookData)) {
      outcomes.push({ service: service.name, status: "empty" });
      logger.debug(
        {
          category: "business",
          event: "isbn.lookup.notfound",
          isbn,
          service: service.name,
        },
        `No results from ${service.name}`,
      );
      continue;
    }

    // Success
    outcomes.push({ service: service.name, status: "found" });
    const pagesNum = extractPageNumber(bookData.pages);
    const { topics, ...bookDataWithoutTopics } = bookData;
    const normalizedData = Object.fromEntries(
      Object.entries({
        ...bookDataWithoutTopics,
        title: cleanTitle(bookData.title),
        subtitle: cleanTitle(bookData.subtitle),
        pages: pagesNum ?? null,
      }).map(([key, value]) => [
        key,
        typeof value === "string" ? value.normalize("NFC") : value,
      ]),
    );

    logger.info(
      {
        category: "business",
        event: "isbn.lookup.found",
        isbn,
        service: service.name,
        title: normalizedData.title,
      },
      `Found via ${service.name}: ${normalizedData.title}`,
    );

    return res.status(200).json(normalizedData);
  }

  // All services exhausted — pick the right status and message
  const errorCount = outcomes.filter((o) => o.status === "error").length;
  const allErrored = errorCount === SERVICES.length;

  logger.info(
    { category: "business", event: "isbn.lookup.failed", isbn, outcomes },
    `Book not found for ISBN ${isbn}`,
  );

  if (allErrored) {
    return res
      .status(503)
      .json({ error: i18n.error.allServicesFailed, details: outcomes });
  }

  if (errorCount > 0) {
    return res
      .status(404)
      .json({ error: i18n.error.partialFailure, details: outcomes });
  }

  return res
    .status(404)
    .json({ error: i18n.error.notFound, details: outcomes });
}
