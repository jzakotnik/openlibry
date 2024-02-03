import { ThemeProvider, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import Grid from "@mui/material/Grid";
import { useRouter } from "next/router";

import Layout from "@/components/layout/Layout";
import { useState } from "react";

import { getAllBooks } from "@/entities/book";
import { PrismaClient } from "@prisma/client";

import { convertDateToDayString, currentTime } from "@/utils/dateutils";

import { BookType } from "@/entities/BookType";

import BookSummaryCard from "@/components/book/BookSummaryCard";

import BookSearchBar from "@/components/book/BookSearchBar";
import BookSummaryRow from "@/components/book/BookSummaryRow";
import itemsjs from "itemsjs";

const prisma = new PrismaClient();
/*
const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
  },
});*/
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
}

export default function Books({ books, numberBooksToShow }: BookPropsType) {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [renderedBooks, setRenderedBooks] = useState(
    books.slice(0, numberBooksToShow)
  );
  const [bookSearchInput, setBookSearchInput] = useState("");
  const [detailView, setDetailView] = useState(true);
  const [bookCreating, setBookCreating] = useState(false);
  const [searchResultNumber, setSearchResultNumber] = useState(0);

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
      per_page: 100,
      sort: "name_asc",
      // full text search
      query: searchString,
    });
    //console.log("Searched books", books);

    console.log("Found books", foundBooks);
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
        router.push("book/" + data.id);
        console.log("Book created", data);
      });
  };

  const handleReturnBook = (id: number, userid: number) => {
    console.log("Return  book");

    fetch(`/api/book/${id}/user/${userid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Book returned, relationship deleted", data, id, userid);
        const newRenderedBooks = renderedBooks.map((b) => {
          console.log("Compare rendered books", b.id, id);
          return b.id === id ? { ...b, rentalStatus: "available" } : b;
        });
        console.log("New rendered books", newRenderedBooks, renderedBooks);
        setRenderedBooks(newRenderedBooks);
      });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const searchString = e.target.value;
    const result = searchBooks(searchString);
    setBookSearchInput(searchString);
  };

  const toggleView = () => {
    const newView = !detailView;
    setDetailView(newView);
    console.log("Detail view render toggled", newView);
  };

  const DetailCardContainer = ({ renderedBooks }: any) => {
    return (
      <Grid container spacing={2} alignItems="stretch">
        {renderedBooks.map((b: BookType) => (
          <Grid item style={{ display: "flex" }} {...gridItemProps} key={b.id}>
            <BookSummaryCard
              book={b}
              returnBook={() => handleReturnBook(b.id!, b.userId!)}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  const SummaryRowContainer = ({ renderedBooks }: any) => {
    return (
      <Grid
        container
        sx={{ width: "100%" }}
        direction="column"
        justifyContent="center"
        alignItems="top"
      >
        {renderedBooks.map((b: BookType) => (
          <BookSummaryRow
            key={b.id}
            book={b}
            handleCopyBook={() => handleCopyBook(b)}
          />
        ))}
      </Grid>
    );
  };

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

export async function getServerSideProps() {
  const allBooks = await getAllBooks(prisma);
  const numberBooksToShow = process.env.NUMBER_BOOKS_OVERVIEW
    ? parseInt(process.env.NUMBER_BOOKS_OVERVIEW)
    : 10;

  const books = allBooks.map((b) => {
    const newBook = { ...b } as any; //define a better type there with conversion of Date to string
    newBook.createdAt = convertDateToDayString(b.createdAt);
    newBook.updatedAt = convertDateToDayString(b.updatedAt);
    newBook.rentedDate = b.rentedDate
      ? convertDateToDayString(b.rentedDate)
      : "";
    newBook.dueDate = b.dueDate ? convertDateToDayString(b.dueDate) : "";
    newBook.searchableTopics = b.topics?.split(";"); //otherwise the itemsjs search doesn't work, but not sure if I can override the type?

    return newBook;
  });

  return { props: { books, numberBooksToShow } };
}
