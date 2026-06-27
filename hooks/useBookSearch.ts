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

  // null = not yet built; building happens after first paint
  const [searchEngine, setSearchEngine] = useState<ReturnType<
    typeof itemsjs
  > | null>(null);

  const queryRef = useRef(bookSearchInput);
  queryRef.current = bookSearchInput;

  const searchableFields = useMemo(
    () => [...SEARCHABLE_FIELDS, ...extraSearchableFields],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [extraSearchableFields.join(",")],
  ) as any;

  // Stable fingerprint: only changes when books are actually added, removed,
  // or modified. Prevents itemsjs rebuilds on SWR reference churn (e.g. the
  // rental page polls every 1s and would otherwise rebuild the index every tick
  // even when no data changed).
  const booksFingerprint = books
    .map((b) => `${b.id}:${b.updatedAt ?? ""}`)
    .join(",");

  // ── Deferred index construction ────────────────────────────────────────────
  // Runs *after* the browser has painted the page, so the book list is visible
  // before we spend time building the itemsjs index.
  useEffect(() => {
    setSearchEngine(null);

    const id = setTimeout(() => {
      const engine = itemsjs(books, { searchableFields });
      setSearchEngine(engine);
    }, 0);

    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booksFingerprint, searchableFields]);

  const searchBooks = useCallback(
    (query: string) => {
      // Index not ready yet — show all books as a passthrough
      if (!searchEngine) {
        setRenderedBooks(books);
        setResultCount(books.length);
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
        setRenderedBooks(books);
        setResultCount(books.length);
      }
    },
    [searchEngine, sort, perPage, books],
  );

  const searchBooksRef = useRef(searchBooks);
  useEffect(() => {
    searchBooksRef.current = searchBooks;
  });

  // Re-run current query once the index finishes building
  useEffect(() => {
    if (!searchEngine) return;
    if (queryRef.current) {
      searchBooksRef.current(queryRef.current);
    }
  }, [searchEngine]);

  const debouncedSearch = useMemo(
    () => debounce((q: string) => searchBooks(q), DEBOUNCE_MS),
    [searchBooks],
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
    searchBooks("");
  }, [debouncedSearch, searchBooks]);

  return {
    renderedBooks,
    bookSearchInput,
    handleInputChange,
    handleClear,
    resultCount,
    indexReady: searchEngine !== null,
  };
}
