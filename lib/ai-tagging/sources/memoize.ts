import type { SourcedTag } from "../types";

/**
 * Process-level in-memory cache for external tag-source lookups (DNB, Open
 * Library, Wikidata). These are keyed by stable identifiers (ISBN, title) whose
 * subject data barely changes, so caching them:
 *
 *  - dedups duplicate lookups within one batch (the same promise is shared
 *    while in flight — two books with the same ISBN hit the network once), and
 *  - avoids re-fetching across batches / page reloads within the TTL.
 *
 * Deliberately NOT a DB table: the cache is advisory, cheap to rebuild, and
 * scoped to the running process. We never cache the final LLM suggestions or
 * the live DB lookups (same-book / same-author) — those must stay fresh.
 *
 * Failure handling: the wrapped source functions fail soft (return [] on
 * timeout/error). To avoid a transient outage poisoning a key for the full TTL,
 * empty results are cached only briefly; non-empty results get the full TTL.
 */

const LONG_TTL_MS = 24 * 60 * 60 * 1000; // 24h — successful, non-empty lookups
const EMPTY_TTL_MS = 5 * 60 * 1000; // 5min — empty results (incl. soft failures)
const MAX_ENTRIES = 2000; // bound memory; LRU-evict the oldest beyond this

type Entry = { promise: Promise<SourcedTag[]>; expires: number };

/**
 * Wraps an external source fetcher with a TTL + LRU in-memory cache. `keyFn`
 * derives the cache key from the args; an empty/falsy key bypasses the cache
 * (passes straight through), so a missing ISBN/title is never cached.
 */
export function memoizeSource<A extends unknown[]>(
  fn: (...args: A) => Promise<SourcedTag[]>,
  keyFn: (...args: A) => string,
): (...args: A) => Promise<SourcedTag[]> {
  const cache = new Map<string, Entry>();

  return (...args: A): Promise<SourcedTag[]> => {
    const key = keyFn(...args);
    if (!key) return fn(...args);

    const now = Date.now();
    const hit = cache.get(key);
    if (hit && hit.expires > now) {
      // Refresh recency for LRU (re-insert moves it to the newest slot).
      cache.delete(key);
      cache.set(key, hit);
      return hit.promise;
    }

    // Delete first so a re-inserted (expired) key moves to the newest LRU slot
    // rather than keeping its old position and being evicted next.
    cache.delete(key);
    const promise = fn(...args);
    const entry: Entry = { promise, expires: now + LONG_TTL_MS };
    cache.set(key, entry);

    promise.then(
      (value) => {
        // Soft failures and genuine "no subjects" both look like []; expire them
        // quickly so a transient outage doesn't suppress a key for a whole day.
        entry.expires = Date.now() + (value.length === 0 ? EMPTY_TTL_MS : LONG_TTL_MS);
      },
      () => {
        // Hard rejection: drop it so the next caller retries.
        cache.delete(key);
      },
    );

    // LRU eviction: trim the oldest entry once over the cap (never the one we
    // just inserted).
    if (cache.size > MAX_ENTRIES) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined && oldest !== key) cache.delete(oldest);
    }

    return promise;
  };
}
