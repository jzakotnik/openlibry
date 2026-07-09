import BookSearchBar from "@/components/book/BookSearchBar";
import BookSummaryCard from "@/components/book/BookSummaryCard";
import Layout from "@/components/layout/Layout";
import { getPagedPublicBooks } from "@/entities/book";
import { BookType } from "@/entities/BookType";
import { prisma } from "@/entities/db";
import { PublicBookType } from "@/entities/PublicBookType";
import { LogEvents } from "@/lib/logEvents";
import { errorLogger } from "@/lib/logger";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";

// =============================================================================
// Types
// =============================================================================

interface CatalogBookType extends BookType {
  searchableTopics: Array<string>;
}

interface CatalogPropsType {
  books: Array<CatalogBookType>;
  total: number;
  numberBooksToShow: number;
  maxBooks: number;
  initialSearch: string;
}

interface PagedCatalogResponse {
  books: Array<PublicBookType | CatalogBookType>;
  total: number;
  page: number;
  pageSize: number;
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * SWR fetcher that throws on non-2xx responses so SWR captures the error
 * instead of trying to JSON-parse an HTML error page and crashing with
 * "Unexpected token '<'". Only used for client-side revalidation — the
 * initial data comes from getServerSideProps below, not this fetch.
 */
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
  });

/**
 * Map PublicBookType → BookType-compatible shape for existing components.
 */
function toCardBook(b: PublicBookType | CatalogBookType): CatalogBookType {
  return {
    id: b.id,
    title: b.title ?? "",
    author: b.author ?? "",
    isbn: b.isbn ?? "",
    topics: b.topics ?? "",
    rentalStatus: b.rentalStatus,
    renewalCount: 0,
    searchableTopics: b.topics ? b.topics.split(";").map((t) => t.trim()) : [],
  } as CatalogBookType;
}

// =============================================================================
// Card Grid
// =============================================================================

interface CatalogCardGridProps {
  renderedBooks: BookType[];
  totalBooks: number;
  maxBooks: number;
  onLoadMore: () => void;
}

const CatalogCardGrid = memo(function CatalogCardGrid({
  renderedBooks,
  totalBooks,
  maxBooks,
  onLoadMore,
}: CatalogCardGridProps) {
  const noop = useCallback(() => {}, []);
  const visibleLimit = Math.min(totalBooks, maxBooks);

  return (
    <div>
      <div
        className="grid gap-3 justify-items-center py-2"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
      >
        {renderedBooks.map((b: BookType) => (
          <BookSummaryCard
            key={b.id}
            book={b}
            returnBook={noop}
            showDetailsControl={false}
            detailHref={`/catalog/${b.id}`}
          />
        ))}
      </div>
      {visibleLimit - renderedBooks.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            Weitere Bücher… {Math.max(0, visibleLimit - renderedBooks.length)}
          </button>
        </div>
      )}
    </div>
  );
});

// =============================================================================
// Page Component
// =============================================================================

export default function Catalog({
  books: initialBooks,
  total: initialTotal,
  numberBooksToShow,
  maxBooks,
  initialSearch,
}: CatalogPropsType) {
  const [bookSearchInput, setBookSearchInput] = useState(initialSearch);
  const [serverSearch, setServerSearch] = useState(initialSearch);
  const [pageSize, setPageSize] = useState(numberBooksToShow);

  useEffect(() => {
    const id = setTimeout(() => {
      setServerSearch(bookSearchInput);
      setPageSize(numberBooksToShow);
    }, 150);

    return () => clearTimeout(id);
  }, [bookSearchInput, numberBooksToShow]);

  const requestUrl = useMemo(() => {
    const params = new URLSearchParams({
      page: "1",
      pageSize: Math.min(pageSize, maxBooks).toString(),
    });
    if (serverSearch.trim()) params.set("q", serverSearch.trim());
    return `/api/public/books?${params.toString()}`;
  }, [pageSize, maxBooks, serverSearch]);

  const { data } = useSWR<PagedCatalogResponse>(requestUrl, fetcher, {
    fallbackData: {
      books: initialBooks,
      total: initialTotal,
      page: 1,
      pageSize: numberBooksToShow,
    },
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  const books = useMemo(
    () => (data?.books ?? initialBooks).map(toCardBook),
    [data?.books, initialBooks],
  );
  const resultCount = data?.total ?? initialTotal;

  const handleInputChangeEvent = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setBookSearchInput(e.target.value);
    },
    [],
  );

  const handleLoadMore = useCallback(() => {
    setPageSize((prev) => Math.min(prev + numberBooksToShow, maxBooks));
  }, [numberBooksToShow, maxBooks]);

  const noop = useCallback(() => {}, []);

  return (
    <Layout publicView={true}>
      <BookSearchBar
        handleInputChange={handleInputChangeEvent}
        handleNewBook={noop}
        bookSearchInput={bookSearchInput}
        toggleView={noop}
        detailView={true}
        searchResultNumber={resultCount}
        showNewBookControl={false}
        showViewToggle={false}
      />
      <CatalogCardGrid
        renderedBooks={books}
        totalBooks={resultCount}
        maxBooks={maxBooks}
        onLoadMore={handleLoadMore}
      />
    </Layout>
  );
}

// =============================================================================
// Server-side data fetching
// =============================================================================

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const numberBooksToShow = process.env.NUMBER_BOOKS_OVERVIEW
    ? parseInt(process.env.NUMBER_BOOKS_OVERVIEW)
    : 10;
  const maxBooks = process.env.NUMBER_BOOKS_MAX
    ? parseInt(process.env.NUMBER_BOOKS_MAX)
    : 1000000;
  const initialSearch =
    typeof context.query.q === "string" ? context.query.q : "";

  try {
    // Calls the same entity function the API route uses, in-process:
    // no self-HTTP round trip, no double JSON serialization.
    const data = await getPagedPublicBooks(prisma, {
      page: 1,
      pageSize: numberBooksToShow,
      query: initialSearch,
    });
    const books = data.books.map(toCardBook);
    return {
      props: {
        books,
        total: data.total,
        numberBooksToShow,
        maxBooks,
        initialSearch,
      },
    };
  } catch (error) {
    errorLogger.error(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/catalog (getServerSideProps)",
        error: error instanceof Error ? error.message : String(error),
      },
      "Error fetching public catalog",
    );
    return {
      props: {
        books: [],
        total: 0,
        numberBooksToShow,
        maxBooks,
        initialSearch,
      },
    };
  }
};
