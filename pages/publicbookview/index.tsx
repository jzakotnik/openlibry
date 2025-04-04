import { ThemeProvider, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import Grid from "@mui/material/Grid";
import { useRouter } from "next/router";

import Layout from "@/components/layout/Layout";
import { useState } from "react";

import { getAllBooks } from "@/entities/book";
import { PrismaClient } from "@prisma/client";

import { convertDateToDayString } from "@/utils/dateutils";

import { BookType } from "@/entities/BookType";

import BookSummaryCard from "@/components/book/BookSummaryCard";

import BookSearchBar from "@/components/book/BookSearchBar";
import BookSummaryRow from "@/components/book/BookSummaryRow";
import { Button } from "@mui/material";
import itemsjs from "itemsjs";

const prisma = new PrismaClient();

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
}

export default function PublicBooks({
  books,
  numberBooksToShow,
  maxBooks,
}: BookPropsType) {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [renderedBooks, setRenderedBooks] = useState(books);
  const [bookSearchInput, setBookSearchInput] = useState("");
  const [detailView, setDetailView] = useState(true);
  const [bookCreating, setBookCreating] = useState(false);
  const [searchResultNumber, setSearchResultNumber] = useState(0);
  const [pageIndex, setPageIndex] = useState(numberBooksToShow);

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
      // full text search
      query: searchString,
    });
    //console.log("Searched books", books);

    console.log("Found books", foundBooks);
    setPageIndex(numberBooksToShow);
    setRenderedBooks(foundBooks.data.items);
    setSearchResultNumber(foundBooks.pagination.total);
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const searchString = e.target.value;
    setPageIndex(numberBooksToShow);
    const result = searchBooks(searchString);
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
      <Grid container spacing={2} alignItems="stretch">
        {renderedBooks.slice(0, pageIndex).map((b: BookType) => (
          <Grid item style={{ display: "flex" }} {...gridItemProps} key={b.id}>
            <BookSummaryCard
              showDetailsControl={false}
              book={b}
              returnBook={() => null}
            />
          </Grid>
        ))}{" "}
        {renderedBooks.length - pageIndex > 0 && (
          <Button onClick={() => setPageIndex(pageIndex + numberBooksToShow)}>
            {"Weitere Bücher..." +
              Math.max(0, renderedBooks.length - pageIndex).toString()}
          </Button>
        )}
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
        {renderedBooks.slice(0, pageIndex).map((b: BookType) => (
          <BookSummaryRow key={b.id} book={b} handleCopyBook={() => null} />
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

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <BookSearchBar
          handleInputChange={handleInputChange}
          handleNewBook={() => {
            console.log("Read only");
          }}
          bookSearchInput={bookSearchInput}
          toggleView={toggleView}
          detailView={detailView}
          searchResultNumber={searchResultNumber}
          showNewBookControl={false}
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

  const maxBooks = process.env.NUMBER_BOOKS_MAX
    ? parseInt(process.env.NUMBER_BOOKS_MAX)
    : 1000000;

  const books = allBooks.map((b) => {
    const newBook = { ...b } as any; //define a better type there with conversion of Date to string
    newBook.createdAt = convertDateToDayString(b.createdAt);
    newBook.updatedAt = convertDateToDayString(b.updatedAt);
    newBook.rentedDate = b.rentedDate
      ? convertDateToDayString(b.rentedDate)
      : "";
    newBook.dueDate = b.dueDate ? convertDateToDayString(b.dueDate) : "";
    newBook.searchableTopics = b.topics ? b.topics.split(";") : ""; //otherwise the itemsjs search doesn't work, but not sure if I can override the type?

    return newBook;
  });

  return { props: { books, numberBooksToShow, maxBooks } };
}
