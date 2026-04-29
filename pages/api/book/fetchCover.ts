import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";
import axios from "axios";
import { fileTypeFromBuffer } from "file-type";
import { promises as fs, readFileSync } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import sharp from "sharp";

const packageJsonPath = path.join(process.cwd(), "package.json");
const packageData = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const currentVersion = packageData.version;

/**
 * Fetch cover image for a book by ISBN.
 *
 * Checks DNB, OpenLibrary and Google. Rotates the order for usage and fallback by random.
 *
 * Query parameters:
 * - isbn (required): The ISBN to look up
 * - bookId (optional): If provided, saves cover to disk and returns JSON.
 *                      If omitted, returns the image data directly (for preview/batch operations).
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { isbn, bookId, mode } = req.query;
  // Falls 'mode' in der URL fehlt, wird die Reihenfolge zufällig (0, 1 oder 2) festgelegt 
  const rotationMode = mode ? parseInt(mode as string) : 2; //Math.floor(Math.random() * 3);

  if (!isbn || typeof isbn !== "string") {
    errorLogger.warn(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/book/fetchCover",
        reason: "Missing ISBN parameter",
      },
      "Cover fetch request missing ISBN",
    );
    return res.status(400).json({ error: "ISBN fehlt", success: false });
  }

  // bookId is optional - if provided, we save to disk; if not, we return the image
  const shouldSave = bookId && typeof bookId === "string";

  // Clean ISBN: remove dashes, spaces, keep X for ISBN-10 check digit
  const cleanedIsbn = isbn.replace(/[^0-9X]/gi, "");

  // Fetch Google API-Key from .env-File
  //const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
  const API_KEY = `${process.env.GOOGLE_BOOKS_API_KEY || ""}`;

  if (!cleanedIsbn) {
    businessLogger.warn(
      {
        event: LogEvents.ISBN_LOOKUP_INVALID,
        isbn,
        bookId: bookId || null,
        reason: "ISBN contains no valid characters",
      },
      "Invalid ISBN format for cover fetch",
    );
    return res.status(400).json({ error: "Ungültige ISBN", success: false });
  }

  businessLogger.debug(
    {
      event: LogEvents.COVER_FETCH_STARTED,
      isbn: cleanedIsbn,
      originalIsbn: isbn,
      bookId: bookId || null,
      mode: shouldSave ? "save" : "preview",
    },
    "Starting cover fetch",
  );

  // Try DNB first, then fallback to OpenLibrary
  const coverSources = [
    {
      name: "DNB",
      //url: `https://portal.dnb.de/opac/mvb/cover?isbn=${cleanedIsbn}`,
      urlFetcher: async () => `https://portal.dnb.de/opac/mvb/cover?isbn=${cleanedIsbn}`,
      logEvent: LogEvents.COVER_FETCHED_DNB,
    },
    {
      name: "OpenLibrary",
      //url: `https://covers.openlibrary.org/b/isbn/${cleanedIsbn}-M.jpg`,
      urlFetcher: async () => `https://covers.openlibrary.org/b/isbn/${cleanedIsbn}-L.jpg`,
      logEvent: LogEvents.COVER_FETCHED_OPENLIBRARY,
    },
    {
      name: "Google",
      urlFetcher: async () => {
        const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanedIsbn}${API_KEY ? `&key=${API_KEY}` : ''}`;

        const search = await axios.get(url, {
          timeout: 2000,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json",
            "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7"
          }
        });

        const firstItem = search.data.items?.[0];
        const id = firstItem?.id;
        const hasImage = firstItem?.volumeInfo?.readingModes?.image === true; // Dieses Flag liefert Info ob google ein Cover hat.

        if (id && hasImage) {
          return `https://books.google.com/books/content?id=${id}&printsec=frontcover&img=1&zoom=3&edge=curl`;
        }
        businessLogger.info({
          event: LogEvents.COVER_FETCH_ATTEMPT,
          source: "Google-Search",
          reason: "Google API reports no image available (readingModes.image is false)"
        }, "Google hat kein Cover für diese ISBN.");
        return null;
      },
      logEvent: LogEvents.COVER_FETCHED_GOOGLE,
    },
  ];

  const rotatedSources = [
    ...coverSources.slice(rotationMode % 3),
    ...coverSources.slice(0, rotationMode % 3)
  ];

  for (const source of rotatedSources) {
    try {
      const targetUrl = await source.urlFetcher();
      if (!targetUrl) continue;

      businessLogger.info(
        {
          event: LogEvents.COVER_FETCH_ATTEMPT,
          source: source.name,
          isbn: cleanedIsbn,
          bookId: bookId || null,
          url: targetUrl,
        },
        `Attempting cover fetch from ${source.name}`,
      );

      const response = await fetch(targetUrl, {
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!response.ok) {
        businessLogger.debug(
          {
            event: LogEvents.COVER_FETCH_ATTEMPT,
            source: source.name,
            isbn: cleanedIsbn,
            bookId: bookId || null,
            httpStatus: response.status,
            reason: "Non-OK HTTP status",
          },
          `${source.name} returned HTTP ${response.status}`,
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
            bookId: bookId || null,
            contentType,
            reason: "Response is not an image",
          },
          `${source.name} did not return an image`,
        );
        continue;
      }

      const arrayBuffer = await response.arrayBuffer();
      let buffer = Buffer.from(arrayBuffer);

      // --- Bild-Abmessung prüfen und gegebenenfalls verkleinern ---
      try {
        const image = sharp(buffer);
        const metadata = await image.metadata();

        // Analyse-Log für Bilder
        businessLogger.debug({
          event: LogEvents.COVER_FETCH_ATTEMPT,
          source: source.name,
          isbn: cleanedIsbn,
          width: metadata.width,
          height: metadata.height,
          sizeKB: (buffer.length / 1024).toFixed(2),
          format: metadata.format,
          msg: `DEBUG: Bild-Metadaten von ${source.name}`
        });

        if (metadata.width && metadata.height && (metadata.width > 1200 || metadata.height > 1200)) {

          businessLogger.debug(
            {
              event: LogEvents.COVER_FETCH_ATTEMPT,
              source: source.name,
              originalWidth: metadata.width,
              originalHeight: metadata.height,
            },
            `Resizing image from ${source.name} (exceeds 1200px)`
          );

          // Skalieren: Die längste Seite auf 1200px, Proportionalität bleibt erhalten
          const resizedBuffer = await image
            .resize({
              width: 1200,
              height: 1200,
              fit: "inside",
              withoutEnlargement: true,
            })
            .jpeg({ quality: 85 })
            .toBuffer();

          buffer = resizedBuffer as any;
        }
      } catch (error: any) {
        errorLogger.error(
          {
            event: (LogEvents as any).IMAGE_PROCESSING_ERROR || "image.processing.error",
            error: error?.message || String(error),
          },
          "Error resizing image with sharp"
        );
        // Falls Sharp fehlschlägt, wird Original-Bild weiterverwendet
      }


      // Validate actual file type using magic bytes
      const fileType = await fileTypeFromBuffer(buffer);

      if (!fileType || !fileType.mime.startsWith("image/")) {
        businessLogger.debug(
          {
            event: LogEvents.COVER_FETCH_ATTEMPT,
            source: source.name,
            isbn: cleanedIsbn,
            bookId: bookId || null,
            detectedMime: fileType?.mime ?? "unknown",
            reason: "Invalid image magic bytes",
          },
          `${source.name} did not return a valid image`,
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
            bookId: bookId || null,
            fileSize: buffer.length,
            reason: "Image too small, likely placeholder",
          },
          `${source.name} returned placeholder image`,
        );
        continue;
      }

      // Found a valid cover
      if (shouldSave) {
        // Save mode: write to disk and return JSON
        const filePath = path.join(
          process.env.COVERIMAGE_FILESTORAGE_PATH!,
          `${bookId}.jpg`,
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
          `Cover saved from ${source.name}`,
        );

        return res.status(200).json({
          success: true,
          source: source.name,
        });
      } else {
        // Preview mode: return image directly
        businessLogger.info(
          {
            event: source.logEvent,
            source: source.name,
            isbn: cleanedIsbn,
            fileSize: buffer.length,
            mimeType: fileType.mime,
            mode: "preview",
          },
          `Cover returned from ${source.name} (preview mode)`,
        );

        res.setHeader("Content-Type", fileType.mime);
        res.setHeader("X-Cover-Source", source.name);
        res.setHeader("Content-Length", buffer.length);
        return res.status(200).send(buffer);
      }
    } catch (error: any) {
      errorLogger.warn(
        {
          event: LogEvents.COVER_FETCH_FAILED,
          source: source.name,
          isbn: cleanedIsbn,
          bookId: bookId || null,
          error: error.message,
          stack: error.stack,
        },
        `Error fetching cover from ${source.name}`,
      );
      // Continue to next source
    }
  }

  // No cover found from any source
  businessLogger.warn(
    {
      event: LogEvents.COVER_NOT_FOUND,
      isbn: cleanedIsbn,
      bookId: bookId || null,
      sourcesChecked: coverSources.map((s) => s.name),
    },
    "No cover found from any source",
  );

  return res.status(404).json({
    error: "Kein Cover gefunden bei DNB oder OpenLibrary",
    success: false,
  });
}
