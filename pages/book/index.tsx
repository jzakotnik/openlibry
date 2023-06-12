import React from "react";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { getImages } from "../api/images";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useRouter } from "next/router";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";

import Layout from "@/components/layout/Layout";
import { useEffect, useState, useMemo } from "react";

import { getAllBooks } from "@/entities/book";
import { PrismaClient } from "@prisma/client";

import List from "@mui/material/List";

import {
  convertDateToDayString,
  currentTime,
} from "@/utils/convertDateToDayString";

import { BookType } from "@/entities/BookType";
import palette from "@/styles/palette";

import BookSummaryCard from "@/components/book/BookSummaryCard";

import BookSearchBar from "@/components/book/BookSearchBar";
import BookSummaryRow from "@/components/book/BookSummaryRow";

const prisma = new PrismaClient();
const gridItemProps = {
  xs: 12,
  sm: 12,
  md: 6,
  lg: 4,
  xl: 4,
};

interface BookPropsType {
  books: Array<BookType>;
  images: Array<string>;
}

export default function Books({ books, images }: BookPropsType) {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [renderedBooks, setRenderedBooks] = useState(books.slice(0, 10));
  const [bookSearchInput, setBookSearchInput] = useState("");
  const [detailView, setDetailView] = useState(true);
  const [bookCreating, setBookCreating] = useState(false);

  if (isMobile) {
    gridItemProps.sm = 12;
    gridItemProps.md = 12;
    gridItemProps.lg = 12;
    gridItemProps.xl = 12;
  }
  const itemsjs = require("itemsjs")(books, {
    searchableFields: ["title", "author", "subtitle", "topics", "id"],
  });

  async function searchBooks(searchString: string) {
    const resultBooks = [] as Array<BookType>;
    const foundBooks = itemsjs.search({
      per_page: 20,
      sort: "name_asc",
      // full text search
      query: searchString,
    });
    //console.log("Found books", foundBooks);
    setRenderedBooks(foundBooks.data.items);
  }

  const handleCreateNewBook = (e: any) => {
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

  const handleInputChange = (e: any) => {
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
              returnBook={() => handleReturnBook(b.id, b.userId)}
              hasImage={b.id?.toString() + ".jpg" in images}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  const SummaryRowContainer = ({ renderedBooks }: any) => {
    return (
      <List sx={{ width: "70%" }} dense={true}>
        {renderedBooks.map((b: BookType) => (
          <BookSummaryRow key={b.id} book={b} />
        ))}
      </List>
    );
  };

  return (
    <Layout>
      <BookSearchBar
        handleInputChange={handleInputChange}
        handleNewBook={handleCreateNewBook}
        bookSearchInput={bookSearchInput}
        toggleView={toggleView}
        detailView={detailView}
      />
      {detailView ? (
        <DetailCardContainer renderedBooks={renderedBooks} />
      ) : (
        <SummaryRowContainer renderedBooks={renderedBooks} />
      )}
    </Layout>
  );
}

export async function getServerSideProps() {
  const imagesArray = await getImages();
  //push array to object for performance reasons
  const images = {};
  imagesArray.map((i) => ((images as any)[i] = "1"));

  const allBooks = await getAllBooks(prisma);

  const books = allBooks.map((b) => {
    const newBook = { ...b } as any; //define a better type there with conversion of Date to string
    newBook.createdAt = convertDateToDayString(b.createdAt);
    newBook.updatedAt = convertDateToDayString(b.updatedAt);
    newBook.rentedDate = b.rentedDate
      ? convertDateToDayString(b.rentedDate)
      : "";
    newBook.dueDate = b.dueDate ? convertDateToDayString(b.dueDate) : "";

    return newBook;
  });

  return { props: { books, images } };
}
