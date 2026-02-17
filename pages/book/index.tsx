import Layout from "@/components/layout/Layout";
import debounce from "debounce";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import BookSearchBar from "@/components/book/BookSearchBar";
import BookSummaryCard from "@/components/book/BookSummaryCard";
import BookSummaryRow from "@/components/book/BookSummaryRow";
import { getAllBooks } from "@/entities/book";
import { BookType } from "@/entities/BookType";
import { prisma, reconnectPrisma } from "@/entities/db";
import { convertDateToDayString } from "@/lib/utils/dateutils";
import itemsjs from "itemsjs";
import { useSnackbar } from "notistack";

const DEBOUNCE_MS = 100;

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

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DetailCardContainer = memo(function DetailCardContainer({
  renderedBooks,
  pageIndex,
  onLoadMore,
  onReturnBook,
}: DetailCardContainerProps) {
  return (
    <div>
      {/* Responsive grid: 1 col on mobile, 2 on sm, 3 on lg */}
      <div
        className="grid gap-3 justify-items-center py-2"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        }}
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
            className="px-4 py-2 text-sm font-medium text-primary
                       hover:bg-primary/10 rounded-lg transition-colors"
          >
            Weitere Bücher...
            {Math.max(0, renderedBooks.length - pageIndex)}
          </button>
        </div>
      )}
    </div>
  );
});

// -----------------------------------------------------------------------------

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
            className="px-4 py-2 text-sm font-medium text-primary
                       hover:bg-primary/10 rounded-lg transition-colors"
          >
            Weitere Bücher...
            {Math.max(0, renderedBooks.length - pageIndex)}
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

  // SWR hook to fetch fresh data
  const { data: freshData, mutate } = useSWR("/api/book", fetcher, {
    fallbackData: { books: initialBooks },
    refreshInterval: 0,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 0,
  });

  const books = freshData?.books || initialBooks;

  const [renderedBooks, setRenderedBooks] = useState(books);
  const [bookSearchInput, setBookSearchInput] = useState("");
  const [detailView, setDetailView] = useState(true);
  const [searchResultNumber, setSearchResultNumber] = useState(books.length);
  const [pageIndex, setPageIndex] = useState(numberBooksToShow);

  const { enqueueSnackbar } = useSnackbar();

  // Memoize search engine — only rebuild when books data changes
  const searchEngine = useMemo(
    () =>
      itemsjs(books, {
        searchableFields: [
          "title",
          "author",
          "subtitle",
          "searchableTopics",
          "id",
        ],
      }),
    [books],
  );

  const searchBooks = useCallback(
    (searchString: string) => {
      const foundBooks = searchEngine.search({
        sort: "name_asc",
        per_page: maxBooks,
        query: searchString,
      });

      let items = foundBooks.data.items;

      // If query contains a number, prioritize title matches
      const numbersInQuery = searchString.match(/\d+/g);
      if (numbersInQuery) {
        items = [...items].sort((a, b) => {
          const aTitle = a.title?.toString() ?? "";
          const bTitle = b.title?.toString() ?? "";
          const aTitleMatch = numbersInQuery.some((n) => aTitle.includes(n));
          const bTitleMatch = numbersInQuery.some((n) => bTitle.includes(n));

          if (aTitleMatch && !bTitleMatch) return -1;
          if (!aTitleMatch && bTitleMatch) return 1;
          return 0;
        });
      }

      setPageIndex(numberBooksToShow);
      setRenderedBooks(items);
      setSearchResultNumber(foundBooks.pagination.total);
    },
    [searchEngine, maxBooks, numberBooksToShow],
  );

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((query: string) => searchBooks(query), DEBOUNCE_MS),
    [searchBooks],
  );

  useEffect(() => {
    return () => {
      debouncedSearch.clear();
    };
  }, [debouncedSearch]);

  // Update rendered books when fresh data arrives
  useEffect(() => {
    setRenderedBooks(books);
    setSearchResultNumber(books.length);
    if (bookSearchInput) {
      searchBooks(bookSearchInput);
    }
  }, [books, bookSearchInput, searchBooks]);

  const handleCreateNewBook = useCallback(() => {
    router.push("/book/new");
  }, [router]);

  const handleCopyBook = useCallback(
    (book: BookType) => {
      router.push("/book/new");
      enqueueSnackbar(
        "Neues Buch erstellen - bitte Daten eingeben oder ISBN scannen",
        { variant: "info" },
      );
    },
    [router, enqueueSnackbar],
  );

  const handleReturnBook = useCallback(
    (id: number, userid: number) => {
      fetch(`/api/book/${id}/user/${userid}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then(() => {
          // Optimistic update
          setRenderedBooks((prev: any) =>
            prev.map((b: any) =>
              b.id === id ? { ...b, rentalStatus: "available" } : b,
            ),
          );
          mutate();
          enqueueSnackbar("Buch zurückgegeben", { variant: "success" });
        })
        .catch(() => {
          enqueueSnackbar("Fehler beim Zurückgeben des Buches", {
            variant: "error",
          });
        });
    },
    [mutate, enqueueSnackbar],
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const searchString = e.target.value;
    setBookSearchInput(searchString);
    debouncedSearch(searchString);
  };

  const toggleView = () => {
    setDetailView((prev) => !prev);
    setPageIndex(numberBooksToShow);
  };

  const handleLoadMore = useCallback(() => {
    setPageIndex((prev) => prev + numberBooksToShow);
  }, [numberBooksToShow]);

  return (
    <Layout>
      <BookSearchBar
        handleInputChange={handleInputChange}
        handleNewBook={handleCreateNewBook}
        bookSearchInput={bookSearchInput}
        toggleView={toggleView}
        detailView={detailView}
        searchResultNumber={searchResultNumber}
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
      props: {
        books,
        numberBooksToShow,
        maxBooks,
        _timestamp: Date.now(),
      },
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
