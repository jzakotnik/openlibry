import { getAllTopics } from "@/entities/book";
import type { PrismaClient } from "@prisma/client";
import type { RankedTag } from "./types";

/**
 * Build the controlled vocabulary handed to the AI: the library's existing
 * tags ranked by frequency, capped to `limit` so token cost stays bounded
 * on large libraries. Matching is case-insensitive but the most common
 * spelling of each tag is preserved as canonical.
 */
export async function rankTopics(
  client: PrismaClient,
  limit = 150,
): Promise<RankedTag[]> {
  const rows = await getAllTopics(client);
  if (!rows) return [];

  // key = lowercased tag → most frequent original spelling + running count
  const counts = new Map<string, { canonical: string; count: number }>();

  for (const row of rows) {
    if (!("topics" in row) || row.topics == null) continue;
    for (const part of row.topics.split(";")) {
      const tag = part.trim();
      if (!tag) continue;
      const key = tag.toLowerCase();
      const existing = counts.get(key);
      if (existing) {
        existing.count++;
      } else {
        counts.set(key, { canonical: tag, count: 1 });
      }
    }
  }

  return [...counts.values()]
    .map((v) => ({ tag: v.canonical, count: v.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
