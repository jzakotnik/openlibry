import { getAllTopics } from "@/entities/book";
import { PrismaClient } from "@prisma/client";

/**
 * Fetches all book topics from the database and returns a deduplicated,
 * trimmed array of topic strings.
 *
 * This replaces the duplicated topic-parsing logic that was previously
 * copy-pasted across multiple getServerSideProps functions.
 */
export async function getUniqueTopics(client: PrismaClient): Promise<string[]> {
  const dbtopics = await getAllTopics(client);

  if (!dbtopics) return [];

  const seen = new Set<string>();

  for (const t of dbtopics) {
    if ("topics" in t && t.topics != null) {
      const parts = t.topics.split(";");
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.length > 0) {
          seen.add(trimmed);
        }
      }
    }
  }

  return Array.from(seen);
}

/**
 * Reads the DELETE_SAFETY_SECONDS env var with a default of 5.
 */
export function getDeleteSafetySeconds(): number {
  return parseInt(process.env.DELETE_SAFETY_SECONDS || "5", 10);
}
