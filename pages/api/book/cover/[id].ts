import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";
import formidable from "formidable";
import type { NextApiRequest, NextApiResponse } from "next";

//this is for uploading image covers

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{
    data: {
      url: string;
    } | null;
    error: string | null;
  }>
) => {
  const bookId = req.query.id;

  try {
    await new Promise((resolve, reject) => {
      const form = formidable({
        uploadDir: process.env.COVERIMAGE_FILESTORAGE_PATH,
        keepExtensions: true,
      });
      form
        .on("error", function (err) {
          errorLogger.error(
            {
              event: LogEvents.COVER_UPLOAD_ERROR,
              bookId,
              error: err instanceof Error ? err.message : String(err),
            },
            "Error uploading cover file"
          );
          reject(err);
        })

        .on("field", function (field, value) {
          businessLogger.debug(
            {
              event: LogEvents.COVER_UPLOAD_FIELD,
              bookId,
              field,
              value,
            },
            "Received file upload field"
          );
        })

        /* this is where the renaming happens */
        .on("fileBegin", function (name, file) {
          const filename = file.filepath.split("/").pop();
          const fileType = filename!.split(".").pop();

          businessLogger.debug(
            {
              event: LogEvents.COVER_UPLOAD_PROCESSING,
              bookId,
              originalFilename: filename,
              fileType,
            },
            "File to be processed"
          );
          file.filepath =
            process.env.COVERIMAGE_FILESTORAGE_PATH! +
            "/" +
            bookId +
            "." +
            "jpg";
        })

        .on("file", function (field, file) {
          businessLogger.debug(
            {
              event: LogEvents.COVER_UPLOAD_RECEIVED,
              bookId,
              filePath: file.filepath,
            },
            "Cover file received"
          );
        })

        .on("progress", function (bytesReceived, bytesExpected) {
          const percent = ((bytesReceived / bytesExpected) * 100) | 0;
          businessLogger.debug(
            {
              event: LogEvents.COVER_UPLOAD_PROGRESS,
              bookId,
              percent,
              bytesReceived,
              bytesExpected,
            },
            "Cover upload progress"
          );
        })

        .on("end", function () {
          businessLogger.info(
            {
              event: LogEvents.COVER_UPLOADED,
              bookId,
            },
            "Cover file saved"
          );
        });

      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    res.status(200).json({
      data: {
        url: "tbd",
      },
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
      "Cover upload failed"
    );
    res.status(500).json({
      data: null,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export default handler;
