import { ThemeProvider, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import Grid from "@mui/material/Grid";

import Layout from "@/components/layout/Layout";
import { useState } from "react";

import { getAllBooks } from "@/entities/book";

import { convertDateToDayString } from "@/utils/dateutils";

import { BookType } from "@/entities/BookType";

import BookSummaryRow from "@/components/book/BookSummaryRow";
import PublicBookSearchBar from "@/components/book/PublicBookSearchBar";
import PublicBookSummaryCard from "@/components/book/PublicBookSummaryCard";
import { Button } from "@mui/material";
import itemsjs from "itemsjs";

import { prisma } from "@/entities/db";

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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [renderedBooks, setRenderedBooks] = useState(books);
  const [bookSearchInput, setBookSearchInput] = useState("");
  const [detailView, setDetailView] = useState(true);

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

  const DetailCardContainer = ({ renderedBooks }: any) => {
    return (
      <Grid container spacing={2} alignItems="stretch">
        {renderedBooks.slice(0, pageIndex).map((b: BookType) => (
          <Grid style={{ display: "flex" }} {...gridItemProps} key={b.id}>
            <PublicBookSummaryCard book={b} />
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
    <Layout publicView={true}>
      <ThemeProvider theme={theme}>
        <PublicBookSearchBar
          handleInputChange={handleInputChange}
          bookSearchInput={bookSearchInput}
          searchResultNumber={searchResultNumber}
        />

        <DetailCardContainer renderedBooks={renderedBooks} />
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
