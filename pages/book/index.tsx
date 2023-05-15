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
import { useEffect, useState } from "react";
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

import dayjs from "dayjs";

import { convertDateToDayString } from "@/utils/convertDateToDayString";

import { UserType } from "@/entities/UserType";
import { BookType } from "@/entities/BookType";
import palette from "@/styles/palette";

import BookSummaryCard from "@/components/book/BookSummaryCard";

const prisma = new PrismaClient();

interface BookPropsType {
  books: Array<BookType>;
  images: Array<string>;
}

export default function Books({ books, images }: BookPropsType) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  console.log("Rendering books", books);
  console.log("received Cover images", images);
  const cardData = books.map((b) => {
    return { id: b.id, title: b.title };
  });

  return (
    <Layout>
      <Grid container spacing={2} alignItems="stretch">
        {books.map((book) => (
          <Grid
            item
            style={{ display: "flex" }}
            {...gridItemProps}
            key={book.id}
          >
            <BookSummaryCard
              book={book}
              hasImage={book.id?.toString() + ".jpg" in images}
            />
          </Grid>
        ))}
      </Grid>
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
    //temp TODO
    return newBook;
  });

  return { props: { books, images } };
}
