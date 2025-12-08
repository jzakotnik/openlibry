import { promises as fs } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { isbn, bookId } = req.query;

  if (!isbn || typeof isbn !== "string") {
    return res.status(400).json({ error: "ISBN fehlt", success: false });
  }
  if (!bookId || typeof bookId !== "string") {
    return res.status(400).json({ error: "Buch-ID fehlt", success: false });
  }

  // Clean ISBN: remove dashes, spaces, keep X for ISBN-10 check digit
  const cleanedIsbn = isbn.replace(/[^0-9X]/gi, "");

  if (!cleanedIsbn) {
    return res.status(400).json({ error: "Ungültige ISBN", success: false });
  }

  // Try DNB first, then fallback to OpenLibrary
  const coverSources = [
    {
      name: "DNB",
      url: `https://portal.dnb.de/opac/mvb/cover?isbn=${cleanedIsbn}`,
    },
    {
      name: "OpenLibrary",
      url: `https://covers.openlibrary.org/b/isbn/${cleanedIsbn}-M.jpg`,
    },
  ];

  for (const source of coverSources) {
    try {
      console.log(`Trying to fetch cover from ${source.name}: ${source.url}`);

      const response = await fetch(source.url, {
        redirect: "follow",
        headers: {
          "User-Agent": "OpenLibry/1.0",
        },
      });

      if (!response.ok) {
        console.log(`${source.name} returned status ${response.status}`);
        continue;
      }

      const contentType = response.headers.get("content-type");

      // Check if we got an actual image
      if (!contentType || !contentType.includes("image")) {
        console.log(`${source.name} did not return an image: ${contentType}`);
        continue;
      }

      // Use arrayBuffer() instead of buffer() for native fetch
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Check if buffer is too small (placeholder image)
      if (buffer.length < 1000) {
        console.log(
          `${source.name} returned too small image (${buffer.length} bytes), likely placeholder`
        );
        continue;
      }

      // Save the cover
      const filePath = path.join(
        process.env.COVERIMAGE_FILESTORAGE_PATH!,
        `${bookId}.jpg`
      );

      await fs.writeFile(filePath, buffer);
      console.log(`Cover saved from ${source.name} for book ID: ${bookId}`);

      return res.status(200).json({
        success: true,
        source: source.name,
      });
    } catch (error: any) {
      console.error(`Error fetching from ${source.name}:`, error.message);
      // Continue to next source
    }
  }

  // No cover found from any source
  return res.status(404).json({
    error: "Kein Cover gefunden bei DNB oder OpenLibrary",
    success: false,
  });
}
