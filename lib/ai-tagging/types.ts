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
 * One book to be tagged. `ref` is an opaque caller-supplied id (book id,
 * batch-entry id, …) used to map batched results back to their book.
 * Only bibliographic fields are ever sent to the provider — never user data.
 */
export interface BookTagInput {
  ref: string;
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

/** A proposed tag plus whether it is new to the library vocabulary. */
export interface TagSuggestion {
  tag: string;
  isNew: boolean;
}

/** Post-processed suggestions for a single book, keyed by its input `ref`. */
export interface BookTagSuggestions {
  ref: string;
  suggestions: TagSuggestion[];
}

/**
 * Pluggable AI tagging provider. `suggest` is the raw model call: it returns,
 * per input ref, a flat list of proposed tag strings. All normalization,
 * vocabulary-snapping, new-tag flagging and capping happens deterministically
 * afterwards in postProcessTags — so providers stay thin.
 */
export interface AiTaggingService {
  name: string;
  suggest(
    books: BookTagInput[],
    vocabulary: RankedTag[],
  ): Promise<Record<string, string[]>>;
}
