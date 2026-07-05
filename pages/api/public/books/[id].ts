import { PublicBookDetailType } from "@/entities/PublicBookDetailType";
import { prisma, reconnectPrisma } from "@/entities/db";
import { getPublicBookDetail } from "@/entities/publicBook";
import { LogEvents } from "@/lib/logEvents";
import { errorLogger } from "@/lib/logger";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PublicBookDetailType | { result: string }>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end(`${req.method} Not Allowed`);
  }

  const id = parseInt(req.query.id as string, 10);
  if (isNaN(id)) {
    return res.status(400).json({ result: "Invalid book ID" });
  }

  if (process.env.NODE_ENV !== "production") {
    await reconnectPrisma();
  }

  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");

  try {
    const detail = await getPublicBookDetail(prisma, id);
    if (!detail) {
      return res.status(404).json({ result: "Book not found" });
    }
    return res.status(200).json(detail);
  } catch (error) {
    errorLogger.error(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/public/books/[id]",
        method: "GET",
        bookId: id,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error fetching public book detail",
    );
    return res.status(500).json({ result: "ERROR: " + error });
  }
}
