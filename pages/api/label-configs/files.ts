/**
 * API Route: /api/label-configs/files
 * Lists all label configuration files from public/labels directory
 */

import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const labelsDir = path.join(process.cwd(), "public", "labels");

  // Ensure directory exists
  if (!fs.existsSync(labelsDir)) {
    fs.mkdirSync(labelsDir, { recursive: true });
  }

  try {
    if (req.method === "GET") {
      // List all JSON files in the directory
      const files = fs
        .readdirSync(labelsDir)
        .filter((file) => file.endsWith(".json"))
        .map((filename) => {
          const filePath = path.join(labelsDir, filename);
          const stats = fs.statSync(filePath);

          try {
            // Read and parse file to get metadata
            const content = fs.readFileSync(filePath, "utf-8");
            const config = JSON.parse(content);

            return {
              filename,
              name: config.name || filename.replace(".json", ""),
              templateId: config.templateId,
              type: config.type,
              modified: stats.mtime.toISOString(),
              size: stats.size,
            };
          } catch (error) {
            // If file is corrupt, return basic info
            return {
              filename,
              name: filename.replace(".json", ""),
              templateId: "unknown",
              type: "unknown",
              modified: stats.mtime.toISOString(),
              size: stats.size,
              error: "Failed to parse file",
            };
          }
        })
        .sort((a, b) => {
          // Sort by modified date, newest first
          return (
            new Date(b.modified).getTime() - new Date(a.modified).getTime()
          );
        });

      return res.status(200).json(files);
    }

    if (req.method === "POST") {
      // Save a new or updated configuration
      const { filename, config } = req.body;

      if (!filename || !config) {
        return res.status(400).json({ error: "Missing filename or config" });
      }

      // Sanitize filename
      const safeFilename = filename.replace(/[^a-z0-9-_]/gi, "-").toLowerCase();
      const fullFilename = safeFilename.endsWith(".json")
        ? safeFilename
        : `${safeFilename}.json`;
      const filePath = path.join(labelsDir, fullFilename);

      // Write file
      fs.writeFileSync(filePath, JSON.stringify(config, null, 2), "utf-8");

      return res.status(200).json({
        success: true,
        filename: fullFilename,
        path: `/labels/${fullFilename}`,
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Label configs API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
