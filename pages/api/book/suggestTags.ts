import { prisma } from "@/entities/db";
import {
  computeStyleProfile,
  gatherSourceCandidates,
  getAiTaggingService,
  getFacetMap,
  getMaxTags,
  loadTaggedCorpus,
  rankTopics,
  reconcileTags,
  renderStyleProfile,
  selectExamples,
  type BookTagInput,
  type BookTagSuggestions,
  type SourcedTag,
  type TagExample,
} from "@/lib/ai-tagging";
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";
import { mapLimit } from "@/lib/utils/concurrency";
import type { NextApiRequest, NextApiResponse } from "next";

type SuggestTagsResponse =
  | { enabled: false }
  | { enabled: true; results: BookTagSuggestions[] }
  | { result: string };

/** Max books accepted per request — keeps the batched model call bounded. */
const MAX_BOOKS = 50;

/**
 * Books whose candidates are gathered concurrently. Each book fans out to
 * several external catalogues, so this caps total in-flight external requests
 * (≈ GATHER_CONCURRENCY × sources) instead of opening one burst per book.
 */
const GATHER_CONCURRENCY = 6;

/**
 * Books per model call. One call for the full 50-book batch has two failure
 * modes this bound removes: at a high AI_TAGGING_MAX_TAGS the JSON response
 * can exceed the output-token cap and truncate (unparseable → every book
 * silently loses its tags), and any per-batch parse failure zeroes all books
 * at once. Chunking confines both to ~10 books.
 */
const MODEL_CHUNK_SIZE = 10;

/** Concurrent model calls for a chunked batch (bounds provider rate usage). */
const SUGGEST_CONCURRENCY = 2;

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
    // Namespaced fallback so a missing ref can't collide with an explicit
    // numeric ref from another book (which would cross-assign candidates/tags).
    ref: typeof b?.ref === "string" && b.ref ? b.ref : `__b${i}`,
    isbn: b?.isbn,
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

    // Semantic facets for the vocabulary (cached on disk, topped up for new
    // tags). Fails soft to {} → the vocabulary is then shown as a flat list.
    const facetMap = await getFacetMap(vocabulary.map((v) => v.tag));

    // Load the already-tagged catalogue once; per book we pick a few similar
    // entries to show the model as worked examples (see selectExamples).
    const corpus = await loadTaggedCorpus(prisma);

    // Style learned from this library's own tags (typical count, facets used).
    const styleProfile = renderStyleProfile(
      computeStyleProfile(corpus, facetMap),
    );

    // Gather grounded candidates for every book, capped concurrency so a large
    // batch doesn't open one external-request burst per book at once. The
    // same-book source short-circuits naturally: if an existing copy already has
    // tags they lead the candidates; otherwise the external sources + author
    // signal carry.
    const entries = await mapLimit(books, GATHER_CONCURRENCY, async (b) => {
      const cand = await gatherSourceCandidates(prisma, b);
      return [b.ref, cand, selectExamples(corpus, b, cand)] as const;
    });
    const candidates: Record<string, SourcedTag[]> = {};
    const examples: Record<string, TagExample[]> = {};
    for (const [ref, cand, ex] of entries) {
      candidates[ref] = cand;
      examples[ref] = ex;
    }

    // Chunked model calls: a failed chunk loses only its own books (they come
    // back without suggestions); other chunks' results still reach the user.
    // Only when EVERY chunk fails is the whole request treated as failed.
    const chunks: BookTagInput[][] = [];
    for (let i = 0; i < books.length; i += MODEL_CHUNK_SIZE) {
      chunks.push(books.slice(i, i + MODEL_CHUNK_SIZE));
    }
    const chunkErrors: unknown[] = [];
    const chunkResults = await mapLimit(
      chunks,
      SUGGEST_CONCURRENCY,
      async (chunk) => {
        try {
          return await service.suggest(
            chunk,
            vocabulary,
            candidates,
            examples,
            facetMap,
            styleProfile,
          );
        } catch (e) {
          chunkErrors.push(e);
          return {} as Record<string, string[]>;
        }
      },
    );
    if (chunkErrors.length === chunks.length) throw chunkErrors[0];
    if (chunkErrors.length > 0) {
      errorLogger.error(
        {
          event: LogEvents.API_ERROR,
          endpoint: "/api/book/suggestTags",
          provider: service.name,
          failedChunks: chunkErrors.length,
          totalChunks: chunks.length,
          error:
            chunkErrors[0] instanceof Error
              ? chunkErrors[0].message
              : String(chunkErrors[0]),
        },
        "Some AI tag chunks failed; their books return without suggestions",
      );
    }
    const raw: Record<string, string[]> = Object.assign({}, ...chunkResults);

    const results: BookTagSuggestions[] = books.map((b) => ({
      ref: b.ref,
      suggestions: reconcileTags(
        raw[b.ref] ?? [],
        candidates[b.ref] ?? [],
        vocabulary,
        maxTags,
        { title: b.title, author: b.author },
        facetMap,
      ),
    }));

    businessLogger.info(
      {
        event: LogEvents.AI_TAGS_SUGGESTED,
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
