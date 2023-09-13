import Layout from "@/components/layout/Layout";
import { Grid } from "@mui/material";

import { useRouter } from "next/router";
import BookRentalList from "@/components/rental/BookRentalList";

import {
  convertDateToDayString,
  replaceBookStringDate,
  extendWeeks,
} from "@/utils/convertDateToDayString";
import { PrismaClient } from "@prisma/client";

import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { getAllUsers } from "@/entities/user";
import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import { getAllBooks, getRentedBooksWithUsers } from "@/entities/book";
import UserRentalList from "@/components/rental/UserRentalList";

interface RentalPropsType {
  books: Array<BookType>;
  users: Array<UserType>;
  rentals: any;
}

const prisma = new PrismaClient();

("use client");
import useSWR from "swr";

const fetcher = (url: any) => fetch(url).then((r) => r.json());

export default function Rental({ books, users, rentals }: RentalPropsType) {
  const router = useRouter();
  const [returnBookSnackbar, setReturnBookSnackbar] = useState(false);
  const [extendBookSnackbar, setExtendBookSnackbar] = useState(false);
  const [userExpanded, setUserExpanded] = useState<number | false>(false);

  const { data, error } = useSWR(
    process.env.NEXT_PUBLIC_API_URL + "/api/rental",
    fetcher,
    { refreshInterval: 1000 }
  );
  console.log("SWR Fetch", data);
  data ? (rentals = data.rentals) : null;
  data ? (books = data.books) : null;
  data ? (users = data.users) : null; //books = data.books;
  //users = data.users;

  const handleReturnBookButton = (bookid: number, userid: number) => {
    console.log("Returning book ", bookid);
    fetch("/api/book/" + bookid + "/user/" + userid, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setReturnBookSnackbar(true);
      });
  };

  const handleExtendBookButton = (bookid: number, book: BookType) => {
    const newbook = replaceBookStringDate(book) as any;
    //extend logic
    const newDueDate = extendWeeks(book.dueDate as Date, 2);
    newbook.dueDate = newDueDate.toDate();
    newbook.renewalCount = newbook.renewalCount + 1;

    delete newbook.user; //don't need the user here
    console.log("Extending book ", bookid);
    fetch("/api/book/" + bookid, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newbook),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setExtendBookSnackbar(true);
      });
  };

  return (
    <Layout>
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="flex-start"
        spacing={2}
        sx={{ my: 1 }}
      >
        <Grid item xs={12} md={6}>
          <UserRentalList
            users={users}
            books={books}
            rentals={rentals}
            handleExtendBookButton={handleExtendBookButton}
            handleReturnBookButton={handleReturnBookButton}
            setUserExpanded={setUserExpanded}
            userExpanded={userExpanded}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <BookRentalList
            books={books}
            handleExtendBookButton={handleExtendBookButton}
            handleReturnBookButton={handleReturnBookButton}
            userExpanded={userExpanded}
          />
        </Grid>
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

  const allRentals = await getRentedBooksWithUsers(prisma);
  const rentals = allRentals.map((r) => {
    //calculate remaining days for the rental
    const due = dayjs(r.dueDate);
    const today = dayjs();
    const diff = today.diff(due, "days");
    console.log("Fetching rental", r);

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

  return { props: { books, users, rentals } };
}
