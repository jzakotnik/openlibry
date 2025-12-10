import Layout from "@/components/layout/Layout";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";

import BookSearchBar from "@/components/book/BookSearchBar";
import BookSummaryCard from "@/components/book/BookSummaryCard";
import BookSummaryRow from "@/components/book/BookSummaryRow";
import { getAllBooks } from "@/entities/book";
import { BookType } from "@/entities/BookType";
import { prisma, reconnectPrisma } from "@/entities/db";
import { convertDateToDayString, currentTime } from "@/utils/dateutils";
import { Button } from "@mui/material";
import itemsjs from "itemsjs";

const gridItemProps = {
  xs: 12,
  sm: 12,
  md: 6,
  lg: 4,
  xl: 4,
};

interface SearchableBookType extends BookType {
  searchableTopics: Array<string>;
}

interface BookPropsType {
  books: Array<SearchableBookType>;
  numberBooksToShow: number;
  maxBooks: number;
  _timestamp?: number;
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Books({
  books: initialBooks,
  numberBooksToShow,
  maxBooks,
}: BookPropsType) {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // SWR hook to fetch fresh data
  const { data: freshData, mutate } = useSWR("/api/books/all", fetcher, {
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
  const [bookCreating, setBookCreating] = useState(false);
  const [searchResultNumber, setSearchResultNumber] = useState(books.length);
  const [pageIndex, setPageIndex] = useState(numberBooksToShow);

  // Update rendered books when fresh data arrives
  useEffect(() => {
    setRenderedBooks(books);
    if (bookSearchInput) {
      searchBooks(bookSearchInput);
    }
  }, [books]);

  if (isMobile) {
    gridItemProps.sm = 12;
    gridItemProps.md = 12;
    gridItemProps.lg = 12;
    gridItemProps.xl = 12;
  }

  const searchEngine = itemsjs(books, {
    searchableFields: ["title", "author", "subtitle", "searchableTopics", "id"],
  });

  async function searchBooks(searchString: string) {
    const foundBooks = searchEngine.search({
      sort: "name_asc",
      per_page: maxBooks,
      query: searchString,
    });

    console.log("Found books", foundBooks);
    setPageIndex(numberBooksToShow);
    setRenderedBooks(foundBooks.data.items);
    setSearchResultNumber(foundBooks.pagination.total);
  }

  const handleCreateNewBook = () => {
    console.log("Creating a new book");
    setBookCreating(true);
    const book: BookType = {
      title: "",
      subtitle: "",
      author: "",
      renewalCount: 0,
      rentalStatus: "available",
      topics: ";",
      rentedDate: currentTime(),
      dueDate: currentTime(),
    };

    fetch("/api/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(book),
    })
      .then((res) => res.json())
      .then((data) => {
        setBookCreating(false);
        // Revalidate SWR cache after creating
        mutate();
        router.push("book/" + data.id);
        console.log("Book created", data);
      });
  };

  const handleCopyBook = (book: BookType) => {
    console.log("Creating a new book from an existing book");
    setBookCreating(true);
    const newBook: BookType = {
      title: book.title,
      subtitle: book.subtitle,
      author: book.author,
      renewalCount: 0,
      rentalStatus: "available",
      topics: book.topics,
      rentedDate: currentTime(),
      dueDate: currentTime(),
    };

    fetch("/api/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newBook),
    })
      .then((res) => res.json())
      .then((data) => {
        setBookCreating(false);
        // Revalidate SWR cache after creating
        mutate();
        router.push("book/" + data.id);
        console.log("Book created", data);
      });
  };

  const handleReturnBook = (id: number, userid: number) => {
    console.log("Return book");

    fetch(`/api/book/${id}/user/${userid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Book returned, relationship deleted", data, id, userid);

        // Optimistic update
        const newRenderedBooks = renderedBooks.map((b: any) => {
          return b.id === id ? { ...b, rentalStatus: "available" } : b;
        });
        setRenderedBooks(newRenderedBooks);

        // Revalidate from server
        mutate();
      });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const searchString = e.target.value;
    setPageIndex(numberBooksToShow);
    searchBooks(searchString);
    setBookSearchInput(searchString);
  };

  const toggleView = () => {
    const newView = !detailView;
    setDetailView(newView);
    setPageIndex(numberBooksToShow);
    console.log("Detail view render toggled", newView);
  };

  const DetailCardContainer = ({ renderedBooks }: any) => {
    return (
      <Grid container spacing={12} alignItems="stretch">
        {renderedBooks.slice(0, pageIndex).map((b: BookType) => (
          <Grid style={{ display: "flex" }} {...gridItemProps} key={b.id}>
            <BookSummaryCard
              book={b}
              returnBook={() => handleReturnBook(b.id!, b.userId!)}
            />
          </Grid>
        ))}
        {renderedBooks.length - pageIndex > 0 && (
          <Button onClick={() => setPageIndex(pageIndex + numberBooksToShow)}>
            {"Weitere Bücher..." +
              Math.max(0, renderedBooks.length - pageIndex).toString()}
          </Button>
        )}
      </Grid>
    );
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
          <DetailCardContainer renderedBooks={renderedBooks} />
        ) : (
          <SummaryRowContainer renderedBooks={renderedBooks} />
        )}
      </ThemeProvider>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  // In test/dev environment, force fresh Prisma connection
  if (process.env.NODE_ENV !== "production") {
    await reconnectPrisma();
  }

  // Disable all caching
  context.res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
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
