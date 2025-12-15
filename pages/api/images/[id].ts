import { existsSync, promises as fs } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";

import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.query.id) {
    errorLogger.warn(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/book/cover/[id]",
        method: req.method,
        reason: "Missing cover ID parameter",
      },
      "Cover ID not provided"
    );
    return res.status(404).end(`${req.query} id not found`);
  }

  const id = parseInt(req.query.id as string);
  const fileName = id + ".jpg";

  switch (req.method) {
    case "GET":
      try {
        // Check if cover storage path is configured
        if (!process.env.COVERIMAGE_FILESTORAGE_PATH) {
          errorLogger.error(
            {
              event: LogEvents.API_ERROR,
              endpoint: "/api/book/cover/[id]",
              bookId: id,
              reason: "COVERIMAGE_FILESTORAGE_PATH not configured",
            },
            "Cover storage path environment variable missing"
          );
          return res.status(500).json({
            data: "ERROR: Cover storage not configured",
          });
        }

        if (!existsSync(process.env.COVERIMAGE_FILESTORAGE_PATH)) {
          errorLogger.error(
            {
              event: LogEvents.API_ERROR,
              endpoint: "/api/book/cover/[id]",
              bookId: id,
              path: process.env.COVERIMAGE_FILESTORAGE_PATH,
              reason: "Cover storage directory does not exist",
            },
            "Cover storage path not found on filesystem"
          );
          return res.status(400).json({
            data: "ERROR: Book cover path does not exist",
          });
        }

        const filePath = path.join(
          process.env.COVERIMAGE_FILESTORAGE_PATH,
          "/",
          fileName
        );
        const defaultFilePath = path.join(
          process.env.COVERIMAGE_FILESTORAGE_PATH,
          "/",
          "default.jpg"
        );

        if (existsSync(filePath)) {
          const imageFile = await fs.readFile(filePath);

          // Debug level - don't spam logs for every cover request
          businessLogger.debug(
            {
              event: LogEvents.COVER_SERVED,
              bookId: id,
              filePath: fileName,
            },
            "Book cover served"
          );

          res.setHeader("Content-Type", "image/jpg");
          res.status(200).send(imageFile);
        } else if (existsSync(defaultFilePath)) {
          const imageBuffer = await fs.readFile(defaultFilePath);

          // Debug level - default cover fallback is normal behavior
          businessLogger.debug(
            {
              event: LogEvents.COVER_DEFAULT_SERVED,
              bookId: id,
              reason: "Custom cover not found",
            },
            "Default cover served for book"
          );

          res.setHeader("Content-Type", "image/jpg");
          res.status(200).send(imageBuffer);
        } else {
          // No cover and no default - this is a problem worth logging
          errorLogger.warn(
            {
              event: LogEvents.COVER_NOT_FOUND,
              bookId: id,
              searchedPath: filePath,
              defaultPath: defaultFilePath,
            },
            "Neither book cover nor default cover found"
          );

          res.status(404).json({
            data: "ERROR: No cover image available",
          });
        }
      } catch (error) {
        errorLogger.error(
          {
            event: LogEvents.API_ERROR,
            endpoint: "/api/book/cover/[id]",
            method: "GET",
            bookId: id,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
          "Failed to serve book cover"
        );
        res.status(400).json({
          data: "ERROR: Book Cover error",
        });
      }
      break;

    default:
      errorLogger.warn(
        {
          event: LogEvents.API_ERROR,
          endpoint: "/api/book/cover/[id]",
          method: req.method,
          bookId: id,
          reason: "Method not allowed",
        },
        "Unsupported HTTP method for cover endpoint"
      );
      res.status(405).end(`${req.method} Not Allowed`);
      break;
  }
}
