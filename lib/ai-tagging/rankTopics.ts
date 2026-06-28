import { getAllTopics } from "@/entities/book";
import type { PrismaClient } from "@prisma/client";
import type { RankedTag } from "./types";

/**
 * Aggregate ";"-separated topics across rows into canonical tags ranked by
 * frequency (descending). Case-insensitive, preserving the most common original
 * spelling as canonical. Shared by the vocabulary builder (rankTopics) and the
 * library-source candidate ranking (sources/library) so the algorithm lives in
 * one place.
 */
export function aggregateTopicCounts(
  rows: Array<{ topics: string | null }>,
): Array<{ canonical: string; count: number }> {
  const counts = new Map<string, { canonical: string; count: number }>();
  for (const row of rows) {
    if (!row || row.topics == null) continue;
    for (const part of row.topics.split(";")) {
      const tag = part.trim();
      if (!tag) continue;
      const key = tag.toLowerCase();
      const existing = counts.get(key);
      if (existing) existing.count++;
      else counts.set(key, { canonical: tag, count: 1 });
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count);
}

/**
 * Build the controlled vocabulary handed to the AI: the library's existing
 * tags ranked by frequency, capped to `limit` so token cost stays bounded
 * on large libraries.
 */
export async function rankTopics(
  client: PrismaClient,
  limit = 150,
): Promise<RankedTag[]> {
  const rows = await getAllTopics(client);
  if (!rows) return [];
  return aggregateTopicCounts(rows)
    .map((v) => ({ tag: v.canonical, count: v.count }))
    .slice(0, limit);
}
