/**
 * Shared types for the optional AI tag-suggestion feature.
 *
 * Mirrors the structure of lib/isbn-services: a provider-agnostic interface
 * (AiTaggingService) with concrete implementations selected at runtime by
 * which API key is present (see ./index getAiTaggingService).
 *
 * The whole feature is inert when no provider key is configured — these
 * types are only ever loaded by the server-side API route.
 */

/** An existing library tag together with how many books carry it. */
export interface RankedTag {
  tag: string;
  count: number;
}

/**
 * Where a tag came from. Drives provenance shown to staff and the trust model:
 *  - "dnb":         Deutsche Nationalbibliothek subject/classification (authoritative, German)
 *  - "openlibrary": Open Library subjects (international/English, strong on fiction)
 *  - "wikidata":    Wikidata genre/subject (structured, multilingual)
 *  - "library":     another book in this library (same author/series)
 *  - "ai":          LLM proposal (reconciled/gap-filled — the only non-deterministic source)
 */
export type TagSource = "dnb" | "openlibrary" | "wikidata" | "library" | "ai";

/** A candidate tag from one source, before reconciliation against the vocabulary. */
export interface SourcedTag {
  tag: string;
  source: TagSource;
}

/**
 * One book to be tagged. `ref` is an opaque caller-supplied id (book id,
 * batch-entry id, …) used to map batched results back to their book.
 * Only bibliographic fields are ever sent to the provider — never user data.
 */
export interface BookTagInput {
  ref: string;
  isbn?: string;
  title?: string;
  subtitle?: string;
  author?: string;
  summary?: string;
  topics?: string;
  publisherName?: string;
  publisherDate?: string;
  minAge?: string;
  maxAge?: string;
}

/**
 * A worked example for the model: a book already catalogued in THIS library
 * together with the tags a librarian gave it. Shown alongside the flat
 * vocabulary so the model learns the library's tagging style/granularity by
 * demonstration, not just which tag words are legal.
 */
export interface TagExample {
  title: string;
  author?: string;
  tags: string[];
}

/** A proposed tag plus whether it is new to the library vocabulary. */
export interface TagSuggestion {
  tag: string;
  isNew: boolean;
  /** Where the tag originated (provenance shown to staff). */
  source?: TagSource;
  /**
   * A new tag that doesn't fit the library's style — a near-synonym of an
   * existing tag, or a proper noun echoing the title/author. Kept (never
   * dropped — a young library needs new tags) but de-emphasized so staff can
   * review it. Always false/absent for existing-vocabulary tags.
   */
  offStyle?: boolean;
}

/** Post-processed suggestions for a single book, keyed by its input `ref`. */
export interface BookTagSuggestions {
  ref: string;
  suggestions: TagSuggestion[];
}

/**
 * Pluggable AI tagging provider. `suggest` is the raw model call: given books,
 * the library vocabulary and grounded source candidates, it returns per input
 * ref a flat list of chosen/normalized tag strings. All vocabulary-snapping,
 * provenance assignment, new-tag flagging and capping happens deterministically
 * afterwards in reconcileTags — so providers stay thin.
 */
export interface AiTaggingService {
  name: string;
  suggest(
    books: BookTagInput[],
    vocabulary: RankedTag[],
    candidates: Record<string, SourcedTag[]>,
    examples?: Record<string, TagExample[]>,
    /** Optional tag→facet map; groups the vocabulary by kind in the prompt. */
    facetMap?: Record<string, string>,
    /** Optional rendered style-profile block (see lib/ai-tagging/style). */
    styleProfile?: string,
  ): Promise<Record<string, string[]>>;
}
