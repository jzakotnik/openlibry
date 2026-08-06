// pages/api/book/cover/[id].ts
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";
import { fileTypeFromBuffer } from "file-type";
import formidable from "formidable";
import { promises as fs } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import sharp from "sharp";
import { Writable } from "stream";

// this is for uploading image covers

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB cap on cover uploads

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{
    data: {
      url: string;
    } | null;
    error: string | null;
  }>,
) => {
  const rawId = req.query.id;

  // --- 1. Validate bookId strictly (matches pages/api/images/[id].ts) ---
  const bookIdStr = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!bookIdStr || !/^\d+$/.test(bookIdStr)) {
    errorLogger.warn(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/book/cover/[id]",
        method: "POST",
        rawId,
        reason: "Invalid bookId",
      },
      "Rejected cover upload with non-numeric bookId",
    );
    return res.status(400).json({
      data: null,
      error: "Invalid book id",
    });
  }
  const bookId = bookIdStr; // safe: [0-9]+ only, no path separators possible

  const storageDir = process.env.COVERIMAGE_FILESTORAGE_PATH;
  if (!storageDir) {
    errorLogger.error(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/book/cover/[id]",
        bookId,
        reason: "COVERIMAGE_FILESTORAGE_PATH not configured",
      },
      "Cover storage path environment variable missing",
    );
    return res.status(500).json({
      data: null,
      error: "Cover storage not configured",
    });
  }

  const destPath = path.join(storageDir, `${bookId}.jpg`);

  try {
    // --- Parse upload entirely in memory; nothing hits disk unvalidated ---
    const chunks: Buffer[] = [];

    const memoryStream = () =>
      new Writable({
        write(chunk, _enc, cb) {
          chunks.push(chunk);
          cb();
        },
      });

    await new Promise<void>((resolve, reject) => {
      const form = formidable({
        maxFiles: 1,
        maxFileSize: MAX_UPLOAD_BYTES,
        fileWriteStreamHandler: memoryStream,
      });

      let gotFile = false;

      form
        .on("error", function (err) {
          errorLogger.error(
            {
              event: LogEvents.COVER_UPLOAD_ERROR,
              bookId,
              error: err instanceof Error ? err.message : String(err),
            },
            "Error uploading cover file",
          );
          reject(err);
        })
        .on("file", function () {
          gotFile = true;
        });

      form.parse(req, (err) => {
        if (err) return reject(err);
        if (!gotFile) return reject(new Error("No file uploaded"));
        resolve();
      });
    });

    const buffer = Buffer.concat(chunks);

    // --- 2. Validate real content via magic bytes, then re-encode via sharp ---
    const type = await fileTypeFromBuffer(buffer);

    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!type || !allowed.has(type.mime)) {
      businessLogger.warn(
        {
          event: LogEvents.COVER_UPLOAD_ERROR,
          bookId,
          detectedType: type?.mime ?? "unknown",
        },
        "Rejected cover upload: not a valid image",
      );
      return res.status(400).json({
        data: null,
        error: "Uploaded file is not a valid image",
      });
    }

    // Re-encode to normalize/strip anything non-image-data (e.g. polyglot
    // payloads) and guarantee the bytes on disk really are a JPEG.
    const jpegBuffer = await sharp(buffer).jpeg().toBuffer();
    await fs.writeFile(destPath, jpegBuffer);

    businessLogger.info(
      {
        event: LogEvents.COVER_UPLOADED,
        bookId,
        detectedType: type.mime,
        bytes: jpegBuffer.length,
      },
      "Cover file saved",
    );

    return res.status(200).json({
      data: { url: `/api/images/${bookId}` },
      error: null,
    });
  } catch (error) {
    errorLogger.error(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/book/cover/upload",
        method: "POST",
        bookId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Cover upload failed",
    );
    return res.status(500).json({
      data: null,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export default handler;
