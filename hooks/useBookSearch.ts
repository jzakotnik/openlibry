import debounce from "debounce";
import itemsjs from "itemsjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BookType } from "@/entities/BookType";
import { LogEvents } from "@/lib/logEvents";
import { errorLogger } from "@/lib/logger";
import { stripZerosFromSearch } from "@/lib/utils/lookups";
import { promoteExactIdMatch } from "@/lib/utils/searchUtils";

const SEARCHABLE_FIELDS = [
  "title",
  "author",
  "subtitle",
  "isbn",
  "id",
  "location",
] as const;
const DEBOUNCE_MS = 150;

interface UseBookSearchOptions {
  extraSearchableFields?: string[];
  sort?: any;
  perPage?: number;
}

interface UseBookSearchResult {
  renderedBooks: BookType[];
  bookSearchInput: string;
  handleInputChange: (value: string) => void;
  handleClear: () => void;
  resultCount: number;
  /** True while the search index is still being built after first paint. */
  indexReady: boolean;
}

export function useBookSearch(
  books: BookType[],
  options: UseBookSearchOptions = {},
): UseBookSearchResult {
  const { extraSearchableFields = [], sort, perPage = 100 } = options;

  const [bookSearchInput, setBookSearchInput] = useState("");
  const [renderedBooks, setRenderedBooks] = useState<BookType[]>(books);
  const [resultCount, setResultCount] = useState(books.length);

  type SearchEngine = ReturnType<typeof itemsjs>;

  // null = not yet built; building happens after first paint
  const [searchEngine, setSearchEngine] = useState<SearchEngine | null>(null);

  const queryRef = useRef(bookSearchInput);
  queryRef.current = bookSearchInput;

  // Keep the latest books available without making callbacks depend on the
  // (unstable) array reference — SWR polling creates a new reference every
  // tick even when nothing changed.
  const booksRef = useRef(books);
  booksRef.current = books;

  const searchableFields = useMemo(
    () => [...SEARCHABLE_FIELDS, ...extraSearchableFields],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [extraSearchableFields.join(",")],
  ) as any;

  // Stable fingerprint: changes when books are added/removed OR when a field
  // relevant to rendering changes. NOTE: `updatedAt` arrives from the API with
  // day granularity (convertDateToDayString), so it does NOT change on a
  // second same-day mutation — rentalStatus/dueDate/userId/renewalCount must
  // be part of the fingerprint or the index goes stale after e.g. a
  // return-then-rent on the same day.
  const booksFingerprint = useMemo(
    () =>
      books
        .map(
          (b) =>
            `${b.id}:${b.rentalStatus ?? ""}:${b.dueDate ?? ""}:${
              b.userId ?? ""
            }:${b.renewalCount ?? ""}:${b.updatedAt ?? ""}`,
        )
        .join(","),
    [books],
  );

  // ── Deferred index construction ────────────────────────────────────────────
  // Runs *after* the browser has painted the page, so the book list is visible
  // before we spend time building the itemsjs index.
  useEffect(() => {
    setSearchEngine(null);

    const id = setTimeout(() => {
      const engine = itemsjs(booksRef.current, {
        searchableFields,
        // @ts-expect-error - removeStopWordFilter is a valid itemsjs runtime option
        // but missing from its shipped TypeScript definitions (itemsapi/itemsjs#46)
        removeStopWordFilter: true,
      });
      setSearchEngine(engine);
    }, 0);

    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booksFingerprint, searchableFields]);

  const searchBooks = useCallback(
    (query: string) => {
      const currentBooks = booksRef.current;

      // Index not ready yet — show all books as a passthrough
      if (!searchEngine) {
        setRenderedBooks(currentBooks);
        setResultCount(currentBooks.length);
        return;
      }

      try {
        const result = searchEngine.search({
          per_page: perPage,
          ...(sort ? { sort } : {}),
          query: stripZerosFromSearch(query),
        });
        const items = result.data.items as BookType[];
        const ranked = promoteExactIdMatch(items, query);
        setRenderedBooks(ranked);
        setResultCount(result.pagination.total);
      } catch (err) {
        errorLogger.error({ err, query }, LogEvents.SEARCH_ERROR);
        setRenderedBooks(currentBooks);
        setResultCount(currentBooks.length);
      }
    },
    [searchEngine, sort, perPage],
  );

  const searchBooksRef = useRef(searchBooks);
  useEffect(() => {
    searchBooksRef.current = searchBooks;
  });

  // Re-run current query once the index finishes (re)building, so rental
  // status changes reach the visible results while a search is active.
  useEffect(() => {
    if (!searchEngine) return;
    if (queryRef.current) {
      searchBooksRef.current(queryRef.current);
    }
  }, [searchEngine]);

  // Created exactly once. Routing through searchBooksRef means SWR reference
  // churn can never recreate the debouncer and silently cancel a pending
  // search (previously: a poll tick landing inside the 150 ms window after
  // typing dropped the search entirely).
  const debouncedSearch = useMemo(
    () => debounce((q: string) => searchBooksRef.current(q), DEBOUNCE_MS),
    [],
  );

  useEffect(() => () => debouncedSearch.clear(), [debouncedSearch]);

  // Sync rendered list when books refresh and no query is active
  useEffect(() => {
    if (!queryRef.current) {
      setRenderedBooks(books);
      setResultCount(books.length);
    }
  }, [books]);

  const handleInputChange = useCallback(
    (value: string) => {
      setBookSearchInput(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  const handleClear = useCallback(() => {
    debouncedSearch.clear();
    setBookSearchInput("");
    searchBooksRef.current("");
  }, [debouncedSearch]);

  return {
    renderedBooks,
    bookSearchInput,
    handleInputChange,
    handleClear,
    resultCount,
    indexReady: searchEngine !== null,
  };
}
