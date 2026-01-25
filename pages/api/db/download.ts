import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";

// Extract database path from DATABASE_URL
function getDatabasePath(): string {
  const dbUrl = process.env.DATABASE_URL || "file:./database/dev.db";
  // Handle both "file:./path" and "file:/path" formats
  const match = dbUrl.match(/^file:(\.\/)?(.+)$/);
  if (match) {
    const relativePath = match[2];
    // If it starts with /, it's absolute in Docker context
    if (relativePath.startsWith("/")) {
      return relativePath;
    }
    return path.join(process.cwd(), relativePath);
  }
  return path.join(process.cwd(), "database", "dev.db");
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `${req.method} Not Allowed` });
  }

  try {
    const dbPath = getDatabasePath();

    // Check if database file exists
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({
        error: "Datenbankdatei nicht gefunden",
        path: dbPath,
      });
    }

    // Get file stats for size
    const stats = fs.statSync(dbPath);

    // Generate filename with date
    const today = new Date();
    const dateStr = `${today.getFullYear()}_${String(
      today.getMonth() + 1,
    ).padStart(2, "0")}_${String(today.getDate()).padStart(2, "0")}`;
    const timeStr = `${String(today.getHours()).padStart(2, "0")}${String(
      today.getMinutes(),
    ).padStart(2, "0")}`;
    const filename = `OpenLibry_Database_${dateStr}_${timeStr}.db`;

    // Set headers for file download
    res.setHeader("Content-Type", "application/x-sqlite3");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", stats.size);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

    // Stream the file
    const fileStream = fs.createReadStream(dbPath);
    fileStream.pipe(res);

    // Handle stream errors
    fileStream.on("error", (error) => {
      console.error("Error streaming database file:", error);
      // Only send error if headers haven't been sent
      if (!res.headersSent) {
        res.status(500).json({ error: "Fehler beim Lesen der Datenbankdatei" });
      }
    });
  } catch (error) {
    console.error("Database download error:", error);
    return res.status(500).json({
      error: "Fehler beim Herunterladen der Datenbank",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
