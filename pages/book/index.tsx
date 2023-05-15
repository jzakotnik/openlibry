import React from "react";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

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
import UserDetailsCard from "@/components/user/UserDetailsCard";
import BookSummaryCard from "@/components/book/BookSummaryCard";

const prisma = new PrismaClient();

interface BookPropsType {
  users: Array<UserType>;
  books: Array<BookType>;
  rentals: any;
}

export default function Books({ users, books, rentals }: BookPropsType) {
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
            <BookSummaryCard book={book} />
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}

export async function getServerSideProps() {
  const allUsers = await getAllUsers(prisma);

  const users = allUsers.map((u) => {
    const newUser = { ...u } as any; //define a better type there with conversion of Date to string
    newUser.createdAt = convertDateToDayString(u.createdAt);
    newUser.updatedAt = convertDateToDayString(u.updatedAt);
    return newUser;
  });

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
  const allRentals = await getRentedBooksWithUsers(prisma);
  const rentals = allRentals.map((r) => {
    //calculate remaining days for the rental
    const due = dayjs(r.dueDate);
    const today = dayjs();
    const diff = today.diff(due, "days");

    return {
      id: r.id,
      title: r.title,
      lastName: r.user?.lastName,
      firstName: r.user?.firstName,
      remainingDays: diff,
      dueDate: convertDateToDayString(due.toDate()),
      renewalCount: r.renewalCount,
      userid: r.user?.id,
    };
  });

  return { props: { users, books, rentals } };
}
