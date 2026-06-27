import { prisma } from "@/entities/db";
import {
  getAiTaggingService,
  getMaxTags,
  postProcessTags,
  rankTopics,
  type BookTagInput,
  type BookTagSuggestions,
} from "@/lib/ai-tagging";
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";
import type { NextApiRequest, NextApiResponse } from "next";

type SuggestTagsResponse =
  | { enabled: false }
  | { enabled: true; results: BookTagSuggestions[] }
  | { result: string };

/** Max books accepted per request — keeps the batched model call bounded. */
const MAX_BOOKS = 50;

/**
 * Proposes tags for one or more books. Returns per-book suggestions with each
 * tag flagged new/existing relative to the library vocabulary. Auth-gated by
 * proxy.ts. Failure is non-fatal to the caller's workflow: any error returns a
 * 502 the UI surfaces as a toast, leaving books importable/saveable untagged.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuggestTagsResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end(`${req.method} Not Allowed`);
  }

  const service = getAiTaggingService();
  if (!service) {
    // No provider key configured — feature is off. 200 so the client can
    // quietly hide the affordance rather than treat it as an error.
    return res.status(200).json({ enabled: false });
  }

  const rawBooks = Array.isArray(req.body?.books) ? req.body.books : null;
  if (!rawBooks || rawBooks.length === 0) {
    return res.status(400).json({ result: "No books provided" });
  }
  if (rawBooks.length > MAX_BOOKS) {
    return res
      .status(400)
      .json({ result: `Too many books (max ${MAX_BOOKS})` });
  }

  // Only bibliographic fields are forwarded to the provider — never user data.
  const books: BookTagInput[] = rawBooks.map((b: any, i: number) => ({
    ref: typeof b?.ref === "string" && b.ref ? b.ref : String(i),
    title: b?.title,
    subtitle: b?.subtitle,
    author: b?.author,
    summary: b?.summary,
    topics: b?.topics,
    publisherName: b?.publisherName,
    publisherDate: b?.publisherDate,
    minAge: b?.minAge,
    maxAge: b?.maxAge,
  }));

  try {
    const vocabulary = await rankTopics(prisma);
    const maxTags = getMaxTags();
    const raw = await service.suggest(books, vocabulary);

    const results: BookTagSuggestions[] = books.map((b) => ({
      ref: b.ref,
      suggestions: postProcessTags(raw[b.ref] ?? [], vocabulary, maxTags),
    }));

    businessLogger.info(
      {
        event: LogEvents.BOOK_UPDATED,
        provider: service.name,
        bookCount: books.length,
      },
      "AI tag suggestions generated",
    );

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ enabled: true, results });
  } catch (error) {
    errorLogger.error(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/book/suggestTags",
        provider: service.name,
        error: error instanceof Error ? error.message : String(error),
      },
      "AI tag suggestion failed",
    );
    return res.status(502).json({ result: "AI tag suggestion failed" });
  }
}
