import Layout from "@/components/layout/Layout";
import { Grid } from "@mui/material";

import BookRentalList from "@/components/rental/BookRentalList";
import { useRouter } from "next/router";
import { forwardRef } from "react";

import {
  convertDateToDayString,
  extendWeeks,
  replaceBookStringDate,
} from "@/utils/convertDateToDayString";
import { PrismaClient } from "@prisma/client";

import UserRentalList from "@/components/rental/UserRentalList";
import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import { getAllBooks, getRentedBooksWithUsers } from "@/entities/book";
import { getAllUsers } from "@/entities/user";
import dayjs from "dayjs";
import { useState } from "react";

import { getBookFromID } from "@/utils/getBookFromID";
import { Snackbar } from "@mui/material";
import MuiAlert, { AlertColor, AlertProps } from "@mui/material/Alert";
import useSWR from "swr";

interface RentalPropsType {
  books: Array<BookType>;
  users: Array<UserType>;
  rentals: any;
}

const prisma = new PrismaClient();

("use client");

const fetcher = (url: any) => fetch(url).then((r) => r.json());

export default function Rental({ books, users, rentals }: RentalPropsType) {
  const router = useRouter();
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackBarSeverity, setSnackBarSeverity] =
    useState<AlertColor>("success");
  const [userExpanded, setUserExpanded] = useState<number | false>(false);

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
          setSnackBarMessage(
            "Leider hat es nicht geklappt, der Server ist aber erreichbar"
          );
          setSnackBarSeverity("error");
          setSnackbarOpen(true);
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setSnackBarMessage(
          "Buch - " + getBookFromID(bookid, books).title + " - zurück gegeben"
        );
        setSnackbarOpen(true);
      })
      .catch((error) => {
        setSnackBarMessage(
          "Server ist leider nicht erreichbar.. Alles ok mit dem internet?"
        );
        setSnackBarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  const handleExtendBookButton = (bookid: number, book: BookType) => {
    console.log("Extending book ", bookid, book);
    const newbook = replaceBookStringDate(book) as any;
    //extend logic
    const newDueDate = extendWeeks(book.dueDate as Date, 2);
    newbook.dueDate = newDueDate.toDate();
    newbook.renewalCount = newbook.renewalCount + 1;

    delete newbook.user; //don't need the user here
    delete newbook._id; // I think this is an id introduced by SWR, no  idea why, but we don't need it in the update call
    console.log("Extending book, json body", JSON.stringify(newbook));

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
          setSnackBarMessage(
            "Leider hat es nicht geklappt, der Server ist aber erreichbar"
          );
          setSnackBarSeverity("error");
          setSnackbarOpen(true);
        }

        return res.json();
      })
      .then((data) => {
        console.log(data);
        setSnackBarMessage("Buch - " + book.title + " - verlängert");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        setSnackBarMessage(
          "Server ist leider nicht erreichbar.. Alles ok mit dem internet?"
        );
        setSnackBarSeverity("error");
        setSnackbarOpen(true);
      });
    //TODO create negative snackbar if something went wrong
  };

  const handleRentBookButton = (bookid: number, userid: number) => {
    console.log("Renting book ", bookid);
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
          setSnackBarMessage(
            "Leider hat es nicht geklappt, der Server ist aber erreichbar"
          );
          setSnackBarSeverity("error");
          setSnackbarOpen(true);
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setSnackBarMessage(
          "Buch " + getBookFromID(bookid, books).title + " ausgeliehen"
        );
        setSnackbarOpen(true);
      })
      .catch((error) => {
        setSnackBarMessage(
          "Server ist leider nicht erreichbar.. Alles ok mit dem internet?"
        );
        setSnackBarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
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
            handleRentBookButton={handleRentBookButton}
            userExpanded={userExpanded}
          />
        </Grid>
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        sx={{ width: "50%" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackBarSeverity}
          sx={{ width: "100%" }}
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>
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

  return { props: { books, users, rentals } };
}
