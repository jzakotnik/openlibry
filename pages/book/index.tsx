import Layout from "@/components/layout/Layout";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { memo, useCallback, useMemo, useState } from "react";
import useSWR from "swr";

import BookSearchBar from "@/components/book/BookSearchBar";
import BookSummaryCard from "@/components/book/BookSummaryCard";
import BookSummaryRow from "@/components/book/BookSummaryRow";
import { getAllBooks } from "@/entities/book";
import { BookType } from "@/entities/BookType";
import { prisma, reconnectPrisma } from "@/entities/db";
import { useBookSearch } from "@/hooks/useBookSearch";
import { convertDateToDayString } from "@/lib/utils/dateutils";
import { toast } from "sonner";

interface SearchableBookType extends BookType {
  searchableTopics: Array<string>;
}

interface BookPropsType {
  books: Array<SearchableBookType>;
  numberBooksToShow: number;
  maxBooks: number;
  _timestamp?: number;
}

interface DetailCardContainerProps {
  renderedBooks: BookType[];
  pageIndex: number;
  numberBooksToShow: number;
  onLoadMore: () => void;
  onReturnBook: (id: number, userId: number) => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DetailCardContainer = memo(function DetailCardContainer({
  renderedBooks,
  pageIndex,
  onLoadMore,
  onReturnBook,
}: DetailCardContainerProps) {
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
            returnBook={() => onReturnBook(b.id!, b.userId!)}
          />
        ))}
      </div>
      {renderedBooks.length - pageIndex > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            Weitere Bücher... {Math.max(0, renderedBooks.length - pageIndex)}
          </button>
        </div>
      )}
    </div>
  );
});

interface SummaryRowContainerProps {
  renderedBooks: BookType[];
  pageIndex: number;
  onLoadMore: () => void;
  onCopyBook: (book: BookType) => void;
}

const SummaryRowContainer = memo(function SummaryRowContainer({
  renderedBooks,
  pageIndex,
  onLoadMore,
  onCopyBook,
}: SummaryRowContainerProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {renderedBooks.slice(0, pageIndex).map((b: BookType) => (
        <BookSummaryRow
          key={b.id}
          book={b}
          handleCopyBook={() => onCopyBook(b)}
        />
      ))}
      {renderedBooks.length - pageIndex > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            Weitere Bücher... {Math.max(0, renderedBooks.length - pageIndex)}
          </button>
        </div>
      )}
    </div>
  );
});

// =============================================================================
// Page Component
// =============================================================================

export default function Books({
  books: initialBooks,
  numberBooksToShow,
  maxBooks,
}: BookPropsType) {
  const router = useRouter();

  const { data: freshData, mutate } = useSWR("/api/book", fetcher, {
    fallbackData: { books: initialBooks },
    refreshInterval: 0,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 0,
  });

  const books = freshData?.books || initialBooks;

  const [detailView, setDetailView] = useState(true);
  const [pageIndex, setPageIndex] = useState(numberBooksToShow);

  const {
    renderedBooks: searchedBooks,
    bookSearchInput,
    handleInputChange,
    resultCount,
  } = useBookSearch(books, {
    extraSearchableFields: ["searchableTopics"],
    perPage: maxBooks,
  });

  // Numeric-query priority sort: if the query contains digits, bubble books
  // whose title contains those digits to the top. Runs only when the query
  // or the base results change — no extra state needed.
  const renderedBooks = useMemo(() => {
    const numbersInQuery = bookSearchInput.match(/\d+/g);
    if (!numbersInQuery) return searchedBooks;

    return [...searchedBooks].sort((a, b) => {
      const aMatch = numbersInQuery.some((n) =>
        a.title?.toString().includes(n),
      );
      const bMatch = numbersInQuery.some((n) =>
        b.title?.toString().includes(n),
      );
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
  }, [searchedBooks, bookSearchInput]);

  // Adapt hook's string-based handler to the event-based signature
  // BookSearchBar expects, and reset pagination on every new search.
  const handleInputChangeEvent = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      handleInputChange(e.target.value);
      setPageIndex(numberBooksToShow);
    },
    [handleInputChange, numberBooksToShow],
  );

  const handleCreateNewBook = useCallback(() => {
    router.push("/book/new");
  }, [router]);

  const handleCopyBook = useCallback(
    (_book: BookType) => {
      router.push("/book/new");
      toast.info(
        "Neues Buch erstellen - bitte Daten eingeben oder ISBN scannen",
      );
    },
    [router],
  );

  // No optimistic update here — mutate() triggers SWR revalidation which
  // flows back into the hook and re-renders with fresh data.
  const handleReturnBook = useCallback(
    (id: number, userid: number) => {
      fetch(`/api/book/${id}/user/${userid}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then(() => {
          mutate();
          toast.success("Buch zurückgegeben");
        })
        .catch(() => {
          toast.error("Fehler beim Zurückgeben des Buches");
        });
    },
    [mutate],
  );

  const toggleView = useCallback(() => {
    setDetailView((prev) => !prev);
    setPageIndex(numberBooksToShow);
  }, [numberBooksToShow]);

  const handleLoadMore = useCallback(() => {
    setPageIndex((prev) => prev + numberBooksToShow);
  }, [numberBooksToShow]);

  return (
    <Layout>
      <BookSearchBar
        handleInputChange={handleInputChangeEvent}
        handleNewBook={handleCreateNewBook}
        bookSearchInput={bookSearchInput}
        toggleView={toggleView}
        detailView={detailView}
        searchResultNumber={resultCount}
      />
      {detailView ? (
        <DetailCardContainer
          renderedBooks={renderedBooks}
          pageIndex={pageIndex}
          numberBooksToShow={numberBooksToShow}
          onLoadMore={handleLoadMore}
          onReturnBook={handleReturnBook}
        />
      ) : (
        <SummaryRowContainer
          renderedBooks={renderedBooks}
          pageIndex={pageIndex}
          onLoadMore={handleLoadMore}
          onCopyBook={handleCopyBook}
        />
      )}
    </Layout>
  );
}

// =============================================================================
// Server-side data fetching
// =============================================================================

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  if (process.env.NODE_ENV !== "production") {
    await reconnectPrisma();
  }

  context.res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  );
  context.res.setHeader("Pragma", "no-cache");
  context.res.setHeader("Expires", "0");

  try {
    const allBooks = await getAllBooks(prisma);
    const numberBooksToShow = process.env.NUMBER_BOOKS_OVERVIEW
      ? parseInt(process.env.NUMBER_BOOKS_OVERVIEW)
      : 10;
    const maxBooks = process.env.NUMBER_BOOKS_MAX
      ? parseInt(process.env.NUMBER_BOOKS_MAX)
      : 1000000;

    const books = allBooks.map((b) => {
      const newBook = { ...b } as any;
      newBook.createdAt = convertDateToDayString(b.createdAt);
      newBook.updatedAt = convertDateToDayString(b.updatedAt);
      newBook.rentedDate = b.rentedDate
        ? convertDateToDayString(b.rentedDate)
        : "";
      newBook.dueDate = b.dueDate ? convertDateToDayString(b.dueDate) : "";
      newBook.searchableTopics = b.topics ? b.topics.split(";") : "";
      return newBook;
    });

    return {
      props: { books, numberBooksToShow, maxBooks, _timestamp: Date.now() },
    };
  } catch (error) {
    console.error("Error fetching books:", error);
    return {
      props: {
        books: [],
        numberBooksToShow: 10,
        maxBooks: 1000000,
        _timestamp: Date.now(),
      },
    };
  }
};
