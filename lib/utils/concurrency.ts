/**
 * Maps `items` through async `fn` with at most `limit` calls in flight at once,
 * preserving input order in the result. A bounded alternative to
 * `Promise.all(items.map(fn))` for fan-out that would otherwise open too many
 * sockets/DB queries at once (e.g. a 50-book batch each hitting several
 * external catalogues).
 */
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workerCount = Math.max(1, Math.min(limit, items.length));
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index], index);
    }
  };
  await Promise.all(Array.from({ length: workerCount }, worker));
  return results;
}
