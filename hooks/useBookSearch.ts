import debounce from "debounce";
import itemsjs from "itemsjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BookType } from "@/entities/BookType";
import { stripZerosFromSearch } from "@/lib/utils/lookups";

const SEARCHABLE_FIELDS = [
  "title",
  "author",
  "subtitle",
  "isbn",
  "id",
] as const;
const DEBOUNCE_MS = 150;

interface UseBookSearchOptions {
  /**
   * Additional fields beyond the shared defaults (e.g. "searchableTopics"
   * on the books overview page).
   */
  extraSearchableFields?: string[];
  /** itemsjs sort descriptor forwarded straight to search(). */
  sort?: any;
  /** Maximum number of results itemsjs returns (default: 100). */
  perPage?: number;
}

interface UseBookSearchResult {
  renderedBooks: BookType[];
  bookSearchInput: string;
  /** Call from the <Input> onChange handler. */
  handleInputChange: (value: string) => void;
  /** Call from the clear button. */
  handleClear: () => void;
  /** Total number of matching books (useful for status lines). */
  resultCount: number;
}

export function useBookSearch(
  books: BookType[],
  options: UseBookSearchOptions = {},
): UseBookSearchResult {
  const { extraSearchableFields = [], sort, perPage = 100 } = options;

  const [bookSearchInput, setBookSearchInput] = useState("");
  const [renderedBooks, setRenderedBooks] = useState<BookType[]>(books);
  const [resultCount, setResultCount] = useState(books.length);

  // Stable ref so the books-refresh effect can read the latest query without
  // adding bookSearchInput to its dependency array.
  const queryRef = useRef(bookSearchInput);
  queryRef.current = bookSearchInput;

  const searchableFields = useMemo(
    () => [...SEARCHABLE_FIELDS, ...extraSearchableFields],
    // extraSearchableFields is caller-defined; serialise to avoid referential churn
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [extraSearchableFields.join(",")],
  ) as any;

  const searchEngine = useMemo(
    () => itemsjs(books, { searchableFields }),
    [books, searchableFields],
  );

  const searchBooks = useCallback(
    (query: string) => {
      const result = searchEngine.search({
        per_page: perPage,
        ...(sort ? { sort } : {}),
        query: stripZerosFromSearch(query),
      });
      setRenderedBooks(result.data.items as BookType[]);
      setResultCount(result.pagination.total);
    },
    [searchEngine, sort, perPage],
  );

  const debouncedSearch = useMemo(
    () => debounce((q: string) => searchBooks(q), DEBOUNCE_MS),
    [searchBooks],
  );

  // Cleanup on unmount / when debouncedSearch changes
  useEffect(() => () => debouncedSearch.clear(), [debouncedSearch]);

  // Re-run search when the underlying books array refreshes (e.g. SWR mutate)
  // without reacting to every keystroke.
  useEffect(() => {
    searchBooks(queryRef.current);
  }, [books, searchBooks]);

  const handleInputChange = useCallback(
    (value: string) => {
      setBookSearchInput(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  const handleClear = useCallback(() => {
    setBookSearchInput("");
    searchBooks("");
  }, [searchBooks]);

  return {
    renderedBooks,
    bookSearchInput,
    handleInputChange,
    handleClear,
    resultCount,
  };
}
