import BookSearchBar from "@/components/book/BookSearchBar";
import BookSummaryCard from "@/components/book/BookSummaryCard";
import Layout from "@/components/layout/Layout";
import { getPublicBooks } from "@/entities/book";
import { BookType } from "@/entities/BookType";
import { prisma } from "@/entities/db";
import { PublicBookType } from "@/entities/PublicBookType";
import { useBookSearch } from "@/hooks/useBookSearch";
import { LogEvents } from "@/lib/logEvents";
import { errorLogger } from "@/lib/logger";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { memo, useCallback, useMemo, useState } from "react";
import useSWR from "swr";

// =============================================================================
// Types
// =============================================================================

interface CatalogBookType extends BookType {
  searchableTopics: Array<string>;
}

interface CatalogPropsType {
  books: Array<CatalogBookType>;
  numberBooksToShow: number;
  maxBooks: number;
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
function toCardBook(b: PublicBookType): CatalogBookType {
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
  pageIndex: number;
  onLoadMore: () => void;
}

const CatalogCardGrid = memo(function CatalogCardGrid({
  renderedBooks,
  pageIndex,
  onLoadMore,
}: CatalogCardGridProps) {
  const noop = useCallback(() => {}, []);

  return (
    <div>
      <div
        className="grid gap-3 justify-items-center py-2"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
      >
        {renderedBooks.slice(0, pageIndex).map((b: BookType) => (
          <BookSummaryCard
            key={b.id}
            book={b}
            returnBook={noop}
            showDetailsControl={false}
            detailHref={`/catalog/${b.id}`}
          />
        ))}
      </div>
      {renderedBooks.length - pageIndex > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            Weitere Bücher… {Math.max(0, renderedBooks.length - pageIndex)}
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
  numberBooksToShow,
  maxBooks,
}: CatalogPropsType) {
  const { data: freshData } = useSWR("/api/public/books", fetcher, {
    fallbackData: initialBooks,
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  const rawBooks: PublicBookType[] = Array.isArray(freshData)
    ? freshData
    : initialBooks;

  const books = useMemo(() => rawBooks.map(toCardBook), [rawBooks]);

  const [pageIndex, setPageIndex] = useState(numberBooksToShow);

  const { renderedBooks, bookSearchInput, handleInputChange, resultCount } =
    useBookSearch(books, {
      extraSearchableFields: ["searchableTopics"],
      perPage: maxBooks,
    });

  const handleInputChangeEvent = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      handleInputChange(e.target.value);
      setPageIndex(numberBooksToShow);
    },
    [handleInputChange, numberBooksToShow],
  );

  const handleLoadMore = useCallback(() => {
    setPageIndex((prev) => prev + numberBooksToShow);
  }, [numberBooksToShow]);

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
        renderedBooks={renderedBooks}
        pageIndex={pageIndex}
        onLoadMore={handleLoadMore}
      />
    </Layout>
  );
}

// =============================================================================
// Server-side data fetching
// =============================================================================

export const getServerSideProps: GetServerSideProps = async (
  _context: GetServerSidePropsContext,
) => {
  const numberBooksToShow = process.env.NUMBER_BOOKS_OVERVIEW
    ? parseInt(process.env.NUMBER_BOOKS_OVERVIEW)
    : 10;
  const maxBooks = process.env.NUMBER_BOOKS_MAX
    ? parseInt(process.env.NUMBER_BOOKS_MAX)
    : 1000000;

  try {
    // Calls the same entity function the API route uses, in-process —
    // no self-HTTP round trip, no double JSON (de)serialization.
    const rawBooks = await getPublicBooks(prisma);
    const books = rawBooks.map(toCardBook);
    return { props: { books, numberBooksToShow, maxBooks } };
  } catch (error) {
    errorLogger.error(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/catalog (getServerSideProps)",
        error: error instanceof Error ? error.message : String(error),
      },
      "Error fetching public catalog",
    );
    return { props: { books: [], numberBooksToShow, maxBooks } };
  }
};
