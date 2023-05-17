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
import { getAllUsers } from "../../entities/user";
import { getAllBooks, getRentedBooksWithUsers } from "@/entities/book";
import { PrismaClient } from "@prisma/client";
import { getUser } from "../../entities/user";

import { translations } from "@/entities/fieldTranslations";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import AccountCircle from "@mui/icons-material/AccountCircle";
import UserAdminList from "@/components/user/UserAdminList";

import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";

import dayjs from "dayjs";

import { convertDateToDayString } from "@/utils/convertDateToDayString";

import { UserType } from "@/entities/UserType";
import { BookType } from "@/entities/BookType";
import palette from "@/styles/palette";

import BookSummaryCard from "@/components/book/BookSummaryCard";
import { Typography } from "@mui/material";

const prisma = new PrismaClient();

interface BookPropsType {
  books: Array<BookType>;
  images: Array<string>;
}

export default function Books({ books, images }: BookPropsType) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [renderedBooks, setRenderedBooks] = useState(books.slice(0, 10));
  const [bookSearchInput, setBookSearchInput] = useState("");
  const [searchIndex, setSearchIndex] = useState<any>();

  const gridItemProps = {
    xs: 12,
    sm: 12,
    md: 6,
    lg: 4,
    xl: 4,
  };

  if (isMobile) {
    gridItemProps.sm = 12;
    gridItemProps.md = 12;
    gridItemProps.lg = 12;
    gridItemProps.xl = 12;
  }
  const itemsjs = require("itemsjs")(books, {
    searchableFields: ["title", "author", "subtitle", "topics"],
  });

  /*useMemo(() => {
    books.map((b) => {
      index.add(b.id, b.title.toLowerCase());
    });
    setSearchIndex(index);
  }, [books]);*/

  const handleInputChange = (e: any) => {
    const searchString = e.target.value;
    const resultBooks = [] as Array<BookType>;
    const foundBooks = itemsjs.search({
      per_page: 20,
      sort: "name_asc",
      // full text search
      query: searchString,
    });
    //console.log("Found books", foundBooks);
    setRenderedBooks(foundBooks.data.items);

    setBookSearchInput(searchString);
  };

  return (
    <Layout>
      <Grid
        container
        direction="row"
        alignItems="center"
        justifyContent="center"
        sx={{ px: 10, my: 5 }}
      >
        <Grid item>
          <FormControl variant="standard">
            <Input
              id="user-search-input"
              startAdornment={
                <InputAdornment position="start">
                  <LocalLibraryIcon />
                </InputAdornment>
              }
              value={bookSearchInput}
              onChange={handleInputChange}
            />
          </FormControl>
        </Grid>
        <Grid item>
          <Button
            onClick={() => {
              console.log("click");
            }}
          >
            Suche
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={2} alignItems="stretch">
        (renderedBooks.length)?
        {renderedBooks.map((b) => (
          <Grid item style={{ display: "flex" }} {...gridItemProps} key={b.id}>
            <BookSummaryCard
              book={b}
              hasImage={b.id?.toString() + ".jpg" in images}
            />
          </Grid>
        ))}{" "}
        : {<Typography>Keine Suchergebnisse gefunden..</Typography>}
      </Grid>{" "}
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
