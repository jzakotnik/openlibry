import { promises as fs } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";
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

  // OpenLibrary cover API - M = medium size, L = large
  const coverUrl = `https://covers.openlibrary.org/b/isbn/${cleanedIsbn}-M.jpg`;

  try {
    const response = await fetch(coverUrl, {
      redirect: "follow",
    });

    // OpenLibrary returns a 1x1 pixel image if cover not found
    // Check content-length to detect this
    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength) < 1000) {
      return res.status(404).json({
        error: "Kein Cover gefunden für diese ISBN",
        success: false,
      });
    }

    if (response.ok) {
      const buffer = await response.buffer();

      // Double-check: if buffer is too small, it's likely a placeholder
      if (buffer.length < 1000) {
        return res.status(404).json({
          error: "Kein Cover gefunden für diese ISBN",
          success: false,
        });
      }

      const filePath = path.join(
        process.env.COVERIMAGE_FILESTORAGE_PATH!,
        `${bookId}.jpg`
      );

      await fs.writeFile(filePath, buffer);
      console.log("Cover saved for book ID:", bookId);

      return res.status(200).json({ success: true });
    }

    return res.status(404).json({
      error: "Cover konnte nicht geladen werden",
      success: false,
    });
  } catch (error: any) {
    console.error("Error fetching cover:", error);
    return res.status(500).json({
      error: error.message || "Fehler beim Laden des Covers",
      success: false,
    });
  }
}
