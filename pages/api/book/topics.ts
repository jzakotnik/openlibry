import { prisma } from "@/entities/db";
import { getUniqueTopics } from "@/lib/utils/getUniqueTopics";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Returns the library's unique topic (Schlagwort) vocabulary. Client-only pages
 * like the batch scanner use it to tell which tags already exist (green) versus
 * are new to the library (blue). Auth-gated by proxy.ts.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ topics: string[] } | { result: string }>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end(`${req.method} Not Allowed`);
  }
  const topics = await getUniqueTopics(prisma);
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ topics });
}
