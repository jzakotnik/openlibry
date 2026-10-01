/**
 * Copy only the listed keys from an untrusted object.
 *
 * Request bodies are spread into Prisma `create`/`update` calls, so without an
 * allow-list a caller can set fields the UI never exposes (timestamps, ids,
 * foreign keys) or use Prisma's nested-write syntax (`books: { connect: ... }`)
 * to touch other records. Keys that are not present on the input are omitted,
 * so `undefined` never overwrites an existing column.
 */
export function pickFields<K extends string>(
  input: unknown,
  keys: readonly K[],
): Partial<Record<K, unknown>> {
  const out: Partial<Record<K, unknown>> = {};
  if (input === null || typeof input !== "object") return out;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      const value = (input as Record<string, unknown>)[key];
      if (value !== undefined) out[key] = value;
    }
  }
  return out;
}
