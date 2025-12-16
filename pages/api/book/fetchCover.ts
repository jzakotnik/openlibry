import { fileTypeFromBuffer } from "file-type";
import { promises as fs } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";

import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { isbn, bookId } = req.query;

  if (!isbn || typeof isbn !== "string") {
    errorLogger.warn(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/cover/fetch",
        reason: "Missing ISBN parameter",
      },
      "Cover fetch request missing ISBN"
    );
    return res.status(400).json({ error: "ISBN fehlt", success: false });
  }

  if (!bookId || typeof bookId !== "string") {
    errorLogger.warn(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/cover/fetch",
        isbn,
        reason: "Missing book ID parameter",
      },
      "Cover fetch request missing book ID"
    );
    return res.status(400).json({ error: "Buch-ID fehlt", success: false });
  }

  // Clean ISBN: remove dashes, spaces, keep X for ISBN-10 check digit
  const cleanedIsbn = isbn.replace(/[^0-9X]/gi, "");

  if (!cleanedIsbn) {
    businessLogger.warn(
      {
        event: LogEvents.ISBN_LOOKUP_INVALID,
        isbn,
        bookId,
        reason: "ISBN contains no valid characters",
      },
      "Invalid ISBN format for cover fetch"
    );
    return res.status(400).json({ error: "Ungültige ISBN", success: false });
  }

  businessLogger.debug(
    {
      event: LogEvents.COVER_FETCH_STARTED,
      isbn: cleanedIsbn,
      originalIsbn: isbn,
      bookId,
    },
    "Starting cover fetch"
  );

  // Try DNB first, then fallback to OpenLibrary
  const coverSources = [
    {
      name: "DNB",
      url: `https://portal.dnb.de/opac/mvb/cover?isbn=${cleanedIsbn}`,
      logEvent: LogEvents.COVER_FETCHED_DNB,
    },
    {
      name: "OpenLibrary",
      url: `https://covers.openlibrary.org/b/isbn/${cleanedIsbn}-M.jpg`,
      logEvent: LogEvents.COVER_FETCHED_OPENLIBRARY,
    },
  ];

  for (const source of coverSources) {
    try {
      businessLogger.debug(
        {
          event: LogEvents.COVER_FETCH_ATTEMPT,
          source: source.name,
          isbn: cleanedIsbn,
          bookId,
          url: source.url,
        },
        `Attempting cover fetch from ${source.name}`
      );

      const response = await fetch(source.url, {
        redirect: "follow",
        headers: {
          "User-Agent": "OpenLibry/1.0",
        },
      });

      if (!response.ok) {
        businessLogger.debug(
          {
            event: LogEvents.COVER_FETCH_ATTEMPT,
            source: source.name,
            isbn: cleanedIsbn,
            bookId,
            httpStatus: response.status,
            reason: "Non-OK HTTP status",
          },
          `${source.name} returned HTTP ${response.status}`
        );
        continue;
      }

      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("image")) {
        businessLogger.debug(
          {
            event: LogEvents.COVER_FETCH_ATTEMPT,
            source: source.name,
            isbn: cleanedIsbn,
            bookId,
            contentType,
            reason: "Response is not an image",
          },
          `${source.name} did not return an image`
        );
        continue;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Validate actual file type using magic bytes
      const fileType = await fileTypeFromBuffer(buffer);

      if (!fileType || !fileType.mime.startsWith("image/")) {
        businessLogger.debug(
          {
            event: LogEvents.COVER_FETCH_ATTEMPT,
            source: source.name,
            isbn: cleanedIsbn,
            bookId,
            detectedMime: fileType?.mime ?? "unknown",
            reason: "Invalid image magic bytes",
          },
          `${source.name} did not return a valid image`
        );
        continue;
      }

      // Check if buffer is too small (placeholder image)
      if (buffer.length < 1000) {
        businessLogger.debug(
          {
            event: LogEvents.COVER_FETCH_ATTEMPT,
            source: source.name,
            isbn: cleanedIsbn,
            bookId,
            fileSize: buffer.length,
            reason: "Image too small, likely placeholder",
          },
          `${source.name} returned placeholder image`
        );
        continue;
      }

      // Save the cover
      const filePath = path.join(
        process.env.COVERIMAGE_FILESTORAGE_PATH!,
        `${bookId}.jpg`
      );

      await fs.writeFile(filePath, buffer);

      businessLogger.info(
        {
          event: source.logEvent,
          source: source.name,
          isbn: cleanedIsbn,
          bookId,
          fileSize: buffer.length,
          mimeType: fileType.mime,
        },
        `Cover saved from ${source.name}`
      );

      return res.status(200).json({
        success: true,
        source: source.name,
      });
    } catch (error: any) {
      errorLogger.warn(
        {
          event: LogEvents.COVER_FETCH_FAILED,
          source: source.name,
          isbn: cleanedIsbn,
          bookId,
          error: error.message,
          stack: error.stack,
        },
        `Error fetching cover from ${source.name}`
      );
      // Continue to next source
    }
  }

  // No cover found from any source
  businessLogger.warn(
    {
      event: LogEvents.COVER_NOT_FOUND,
      isbn: cleanedIsbn,
      bookId,
      sourcesChecked: coverSources.map((s) => s.name),
    },
    "No cover found from any source"
  );

  return res.status(404).json({
    error: "Kein Cover gefunden bei DNB oder OpenLibrary",
    success: false,
  });
}
