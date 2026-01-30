import Layout from "@/components/layout/Layout";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import debounce from "debounce";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import BookSearchBar from "@/components/book/BookSearchBar";
import BookSummaryCard from "@/components/book/BookSummaryCard";
import BookSummaryRow from "@/components/book/BookSummaryRow";
import { getAllBooks } from "@/entities/book";
import { BookType } from "@/entities/BookType";
import { prisma, reconnectPrisma } from "@/entities/db";
import { convertDateToDayString } from "@/lib/utils/dateutils";
import { Button } from "@mui/material";
import itemsjs from "itemsjs";
import { useSnackbar } from "notistack";
import { memo } from "react";

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
  gridItemProps: Record<string, number>;
  onLoadMore: () => void;
  onReturnBook: (id: number, userId: number) => void;
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DetailCardContainer = memo(function DetailCardContainer({
  renderedBooks,
  pageIndex,
  numberBooksToShow,
  gridItemProps,
  onLoadMore,
  onReturnBook,
}: DetailCardContainerProps) {
  return (
    <Grid container spacing={12} alignItems="stretch">
      {renderedBooks.slice(0, pageIndex).map((b: BookType) => (
        <Grid style={{ display: "flex" }} {...gridItemProps} key={b.id}>
          <BookSummaryCard
            book={b}
            returnBook={() => onReturnBook(b.id!, b.userId!)}
          />
        </Grid>
      ))}
      {renderedBooks.length - pageIndex > 0 && (
        <Button onClick={onLoadMore}>
          {"Weitere Bücher..." +
            Math.max(0, renderedBooks.length - pageIndex).toString()}
        </Button>
      )}
    </Grid>
  );
});

export default function Books({
  books: initialBooks,
  numberBooksToShow,
  maxBooks,
}: BookPropsType) {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // SWR hook to fetch fresh data
  const { data: freshData, mutate } = useSWR("/api/book", fetcher, {
    fallbackData: { books: initialBooks },
    refreshInterval: 0, // Only refresh on demand, not automatically
    revalidateOnFocus: true, // Revalidate when window gains focus
    revalidateOnReconnect: true,
    dedupingInterval: 0, // No deduplication in test mode
  });

  const books = freshData?.books || initialBooks;

  const [renderedBooks, setRenderedBooks] = useState(books);
  const [bookSearchInput, setBookSearchInput] = useState("");
  const [detailView, setDetailView] = useState(true);
  const [searchResultNumber, setSearchResultNumber] = useState(books.length);
  const [pageIndex, setPageIndex] = useState(numberBooksToShow);

  const { enqueueSnackbar } = useSnackbar();

  // Memoize search engine - only rebuild when books data changes
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

      setPageIndex(numberBooksToShow);
      setRenderedBooks(foundBooks.data.items);
      setSearchResultNumber(foundBooks.pagination.total);
    },
    [searchEngine, maxBooks, numberBooksToShow],
  );

  // Debounced search function - waits some milliseconds after last keystroke
  const debouncedSearch = useMemo(
    () => debounce((query: string) => searchBooks(query), DEBOUNCE_MS),
    [searchBooks],
  );

  // Cleanup debounce on unmount
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

  const currentGridItemProps = useMemo(
    () =>
      isMobile
        ? { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }
        : { xs: 12, sm: 12, md: 6, lg: 4, xl: 4 },
    [isMobile],
  );

  /**
   * Navigate to the new book creation page.
   * This replaces the old behavior of immediately creating an empty book.
   * Benefits:
   * - No orphan/empty books created by accident
   * - User can cancel without database changes
   * - Cleaner data model
   */
  const handleCreateNewBook = useCallback(() => {
    router.push("/book/new");
  }, [router]);

  const handleCopyBook = useCallback(
    (book: BookType) => {
      // Navigate to new book page with pre-filled data via query params
      // For now, we'll just navigate and let user fill manually
      // A more sophisticated approach would use sessionStorage or query params
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
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          // Optimistic update
          const newRenderedBooks = renderedBooks.map((b: any) => {
            return b.id === id ? { ...b, rentalStatus: "available" } : b;
          });
          setRenderedBooks(newRenderedBooks);

          // Revalidate from server
          mutate();
          enqueueSnackbar("Buch zurückgegeben", { variant: "success" });
        })
        .catch((error) => {
          enqueueSnackbar("Fehler beim Zurückgeben des Buches", {
            variant: "error",
          });
        });
    },
    [renderedBooks, mutate, enqueueSnackbar],
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const searchString = e.target.value;
    setBookSearchInput(searchString); // Update input immediately for responsive typing
    debouncedSearch(searchString); // Debounce the actual search
  };

  const toggleView = () => {
    const newView = !detailView;
    setDetailView(newView);
    setPageIndex(numberBooksToShow);
  };

  const SummaryRowContainer = ({ renderedBooks }: any) => (
    <Stack spacing={2} sx={{ width: "100%" }}>
      {renderedBooks.slice(0, pageIndex).map((b: BookType) => (
        <BookSummaryRow
          key={b.id}
          book={b}
          handleCopyBook={() => handleCopyBook(b)}
        />
      ))}
      {renderedBooks.length - pageIndex > 0 && (
        <Button onClick={() => setPageIndex(pageIndex + numberBooksToShow)}>
          {"Weitere Bücher..." +
            Math.max(0, renderedBooks.length - pageIndex).toString()}
        </Button>
      )}
    </Stack>
  );

  const handleLoadMore = useCallback(() => {
    setPageIndex((prev) => prev + numberBooksToShow);
  }, [numberBooksToShow]);

  return (
    <Layout>
      <ThemeProvider theme={theme}>
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
            gridItemProps={currentGridItemProps}
            onLoadMore={handleLoadMore}
            onReturnBook={handleReturnBook}
          />
        ) : (
          <SummaryRowContainer renderedBooks={renderedBooks} />
        )}
      </ThemeProvider>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  // In test/dev environment, force fresh Prisma connection
  if (process.env.NODE_ENV !== "production") {
    await reconnectPrisma();
  }

  // Disable all caching
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
