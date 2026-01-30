import crypto from "crypto";
import { createReadStream, existsSync, statSync } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";

import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";

// Disable response size limit for image streaming
export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    errorLogger.warn(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/images/[id]",
        method: req.method,
        reason: "Method not allowed",
      },
      "Unsupported HTTP method for images endpoint",
    );
    return res.status(405).end(`${req.method} Not Allowed`);
  }

  if (!req.query.id) {
    errorLogger.warn(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/images/[id]",
        method: req.method,
        reason: "Missing image ID parameter",
      },
      "Image ID not provided",
    );
    return res.status(404).end("id not found");
  }

  const id = parseInt(req.query.id as string);
  const fileName = `${id}.jpg`;
  const basePath = process.env.COVERIMAGE_FILESTORAGE_PATH;

  // Check if cover storage path is configured
  if (!basePath) {
    errorLogger.error(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/images/[id]",
        bookId: id,
        reason: "COVERIMAGE_FILESTORAGE_PATH not configured",
      },
      "Cover storage path environment variable missing",
    );
    return res.status(500).json({
      data: "ERROR: Cover storage not configured",
    });
  }

  if (!existsSync(basePath)) {
    errorLogger.error(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/images/[id]",
        bookId: id,
        path: basePath,
        reason: "Cover storage directory does not exist",
      },
      "Cover storage path not found on filesystem",
    );
    return res.status(400).json({
      data: "ERROR: Book cover path does not exist",
    });
  }

  const filePath = path.join(basePath, fileName);
  const defaultFilePath = path.join(basePath, "default.jpg");

  // Check file existence upfront
  const customCoverExists = existsSync(filePath);
  const defaultCoverExists = existsSync(defaultFilePath);

  if (!customCoverExists && !defaultCoverExists) {
    errorLogger.warn(
      {
        event: LogEvents.COVER_NOT_FOUND,
        bookId: id,
        searchedPath: filePath,
        defaultPath: defaultFilePath,
      },
      "Neither book cover nor default cover found",
    );
    return res.status(404).json({
      data: "ERROR: No cover image available",
    });
  }

  const isDefault = !customCoverExists;
  const targetPath = customCoverExists ? filePath : defaultFilePath;

  try {
    const stat = statSync(targetPath);

    // Generate ETag from file path and modification time
    const etag = crypto
      .createHash("md5")
      .update(`${targetPath}-${stat.mtime.getTime()}-${stat.size}`)
      .digest("hex");

    // Check if client has cached version (conditional request)
    const clientEtag = req.headers["if-none-match"];
    if (clientEtag === `"${etag}"`) {
      businessLogger.debug(
        {
          event: LogEvents.COVER_SERVED,
          bookId: id,
          cached: true,
        },
        "Cover served from client cache (304)",
      );
      return res.status(304).end();
    }

    // Cache for 1 year for custom covers, 1 day for default
    // Custom covers change rarely; default might be updated
    const maxAge = isDefault ? 86400 : 31536000;

    // Set caching headers
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Content-Length", stat.size);
    res.setHeader("ETag", `"${etag}"`);
    res.setHeader("Last-Modified", stat.mtime.toUTCString());
    res.setHeader("Cache-Control", "public, no-cache, must-revalidate");

    // Log the serve event
    if (isDefault) {
      businessLogger.debug(
        {
          event: LogEvents.COVER_DEFAULT_SERVED,
          bookId: id,
          reason: "Custom cover not found",
        },
        "Default cover served for book",
      );
    } else {
      businessLogger.debug(
        {
          event: LogEvents.COVER_SERVED,
          bookId: id,
          filePath: fileName,
          size: stat.size,
        },
        "Book cover served",
      );
    }

    // Stream the file instead of loading into memory
    const stream = createReadStream(targetPath);

    stream.on("error", (error) => {
      errorLogger.error(
        {
          event: LogEvents.API_ERROR,
          endpoint: "/api/images/[id]",
          method: "GET",
          bookId: id,
          error: error.message,
          stack: error.stack,
        },
        "Error streaming book cover",
      );

      // Only send error if headers haven't been sent
      if (!res.headersSent) {
        res.status(500).json({ data: "ERROR: Failed to stream image" });
      }
    });

    stream.pipe(res);
  } catch (error) {
    errorLogger.error(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/images/[id]",
        method: "GET",
        bookId: id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      "Failed to serve book cover",
    );
    res.status(500).json({
      data: "ERROR: Book Cover error",
    });
  }
}
