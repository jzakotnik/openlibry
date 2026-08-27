/**
 * i18n types.
 *
 * The `Dictionary` type is re-exported from `./de` (which is the source of
 * truth for translation keys). All other locale files must conform to this
 * shape — TypeScript will flag any missing or extra keys at compile time.
 */

export type Locale = "de" | "en";

export const SUPPORTED_LOCALES: readonly Locale[] = ["de", "en"] as const;

export const DEFAULT_LOCALE: Locale = "de";

/**
 * Values stored in the dictionary tree. Leaves are strings; branches are
 * nested objects of the same shape.
 */
export type DictionaryNode = string | { [key: string]: DictionaryNode };
