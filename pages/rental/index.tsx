//("use client");
import Layout from "@/components/layout/Layout";
import { Grid } from "@mui/material";

import BookRentalList from "@/components/rental/BookRentalList";
import { useRouter } from "next/router";
import { forwardRef } from "react";

import {
  convertDateToDayString,
  extendDays,
  replaceBookStringDate,
  sameDay,
} from "@/utils/dateutils";
import { PrismaClient } from "@prisma/client";

import UserRentalList from "@/components/rental/UserRentalList";
import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import { getAllBooks, getRentedBooksWithUsers } from "@/entities/book";
import { getAllUsers } from "@/entities/user";
import dayjs from "dayjs";
import { useRef, useState } from "react";

import { RentalsUserType } from "@/entities/RentalsUserType";
import { getBookFromID } from "@/utils/getBookFromID";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { useSnackbar } from "notistack";
import useSWR from "swr";

interface RentalPropsType {
  books: Array<BookType>;
  users: Array<UserType>;
  rentals: Array<RentalsUserType>;
  extensionDays: number;
  bookSortBy: string;
}

const prisma = new PrismaClient();

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Rental({
  books,
  users,
  rentals,
  extensionDays,
  bookSortBy,
}: RentalPropsType) {
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [userExpanded, setUserExpanded] = useState<number | false>(false);

  const bookFocusRef = useRef<HTMLInputElement>(undefined);
  const handleBookSearchSetFocus = () => {
    bookFocusRef.current!.focus();
    bookFocusRef.current!.select();
  }

  const userFocusRef = useRef<HTMLInputElement>(undefined);
  const handleUserSearchSetFocus = () => {
    userFocusRef.current!.focus();
    userFocusRef.current!.select();
  }

  const { data, error } = useSWR(
    process.env.NEXT_PUBLIC_API_URL + "/api/rental",
    fetcher,
    { refreshInterval: 1000 }
  );
  console.log("SWR Fetch performed");
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
      .then((res) => {
        if (!res.ok) {
          console.log(
            "ERROR while calling API for returning the book",
            res.statusText
          );
          enqueueSnackbar(
            "Leider hat es nicht geklappt, der Server ist aber erreichbar"
            , { variant: "error" });

        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
        enqueueSnackbar(
          "Buch - " + getBookFromID(bookid, books).title + " - zurückgegeben"
        );
      })
      .catch((error) => {
        enqueueSnackbar(
          "Server ist leider nicht erreichbar. Alles OK mit dem Internet?"
          , { variant: "error" });
      });
    handleBookSearchSetFocus();
  };
  const newDueDate = extendDays(new Date(), extensionDays);

  const handleExtendBookButton = (bookid: number, book: BookType) => {
    // console.log("Extending book ", bookid, book);
    const newbook = replaceBookStringDate(book) as any;

    // console.log("Extension days: ", extensionDays);
    //extend logic

    if (sameDay(newbook.dueDate, newDueDate)) {
      enqueueSnackbar("Buch - " + book.title + " - ist bereits bis zum maximalen Ende ausgeliehen", { variant: "warning" });
      return;
    }
    newbook.renewalCount = newbook.renewalCount + 1;
    newbook.dueDate = newDueDate.toDate();

    delete newbook.user; //don't need the user here
    delete newbook._id; // I think this is an id introduced by SWR, no  idea why, but we don't need it in the update call
    // console.log("Extending book, json body", JSON.stringify(newbook));

    fetch("/api/book/" + bookid, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newbook),
    })
      .then((res) => {
        if (!res.ok) {
          console.log(
            "ERROR while calling API for extending the book",
            res.statusText
          );
          enqueueSnackbar(
            "Leider hat es nicht geklappt, der Server ist aber erreichbar"
            , { variant: "error" });
        }

        return res.json();
      })
      .then((data) => {
        // console.log(data);
        enqueueSnackbar("Buch - " + book.title + " - verlängert");

      })
      .catch((error) => {
        enqueueSnackbar(
          "Server ist leider nicht erreichbar. Alles OK mit dem Internet?"
          , { variant: "error" });
      });
    handleBookSearchSetFocus();
  };

  const handleRentBookButton = (bookid: number, userid: number) => {
    console.log("Renting book for ", bookid, userid);
    fetch("/api/book/" + bookid + "/user/" + userid, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          console.log(
            "ERROR while calling API for renting the book",
            res.statusText
          );
          enqueueSnackbar(
            "Leider hat es nicht geklappt, der Server ist aber erreichbar"
            , { variant: "error" });

        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
        enqueueSnackbar(
          "Buch " + getBookFromID(bookid, books).title + " ausgeliehen"
        );

      })
      .catch((error) => {
        enqueueSnackbar(
          "Server ist leider nicht erreichbar. Alles OK mit dem Internet?"
          , { variant: "error" });

      });
    handleBookSearchSetFocus();
  };


  const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref
  ) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });
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
        <Grid size={{ xs: 12, md: 6 }}>
          <UserRentalList
            users={users}
            books={books}
            rentals={rentals}
            handleExtendBookButton={handleExtendBookButton}
            handleReturnBookButton={handleReturnBookButton}
            setUserExpanded={setUserExpanded}
            userExpanded={userExpanded}
            searchFieldRef={userFocusRef}
            handleBookSearchSetFocus={handleBookSearchSetFocus}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <BookRentalList
            books={books}
            users={users} //to figure out the name of the user who rented
            handleExtendBookButton={handleExtendBookButton}
            handleReturnBookButton={handleReturnBookButton}
            handleRentBookButton={handleRentBookButton}
            userExpanded={userExpanded}
            searchFieldRef={bookFocusRef}
            handleUserSearchSetFocus={handleUserSearchSetFocus}
            extensionDueDate={newDueDate}
            sortBy={bookSortBy}
          />
        </Grid>
      </Grid>

    </Layout>
  );
}

export async function getServerSideProps() {
  const extensionDays = process.env.EXTENSION_DURATION_DAYS || 14;
  const bookSortBy = process.env.RENTAL_SORT_BOOKS || 'title_asc';
  const allUsers = await getAllUsers(prisma);

  const users = allUsers.map((u) => {
    const newUser = { ...u } as any; //define a better type there with conversion of Date to string
    newUser.createdAt = convertDateToDayString(u.createdAt);
    newUser.updatedAt = convertDateToDayString(u.updatedAt);
    return newUser;
  });

  const allRentals = await getRentedBooksWithUsers(prisma);
  const rentals = allRentals.map((r: any) => {
    //calculate remaining days for the rental
    const due = dayjs(r.dueDate);
    const today = dayjs();
    const diff = today.diff(due, "days");
    //console.log("Fetching rental", r);

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
  //console.log("Initial fetch of books", books[0]);

  return { props: { books, users, rentals, extensionDays, bookSortBy } };
}
