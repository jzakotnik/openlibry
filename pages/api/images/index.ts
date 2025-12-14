import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";

import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";

type Data = {
  result: Array<string>;
};

export async function getImages() {
  const dir = process.env.COVERIMAGE_FILESTORAGE_PATH;

  if (!dir) {
    throw new Error("COVERIMAGE_FILESTORAGE_PATH not configured");
  }

  const filenames = fs.readdirSync(dir);
  return filenames;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "GET") {
    try {
      const images = await getImages();

      businessLogger.debug(
        {
          event: LogEvents.COVER_LIST_RETRIEVED,
          imageCount: images.length,
        },
        "Cover image list retrieved"
      );

      res.status(200).json({ result: images });
    } catch (error) {
      errorLogger.error(
        {
          event: LogEvents.API_ERROR,
          endpoint: "/api/images",
          method: "GET",
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        "Failed to list cover images"
      );
      res.status(400).json({ result: ["ERROR: " + error] });
    }
  } else {
    errorLogger.warn(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/images",
        method: req.method,
        reason: "Method not allowed",
      },
      "Unsupported HTTP method for images endpoint"
    );
    res.status(405).json({ result: ["ERROR: Method not allowed"] });
  }
}
