// ("use client"); // keep commented if you're in /pages with getServerSideProps
import Layout from "@/components/layout/Layout";

// ✅ Use the newest MUI Grid v2
import Grid from "@mui/material/Grid";

import BookRentalList from "@/components/rental/BookRentalList";
import UserRentalList from "@/components/rental/UserRentalList";

import { useRouter } from "next/router";
import { forwardRef, useRef, useState } from "react";

import {
  convertDateToDayString,
  extendDays,
  replaceBookStringDate,
  sameDay,
} from "@/utils/dateutils";

import { BookType } from "@/entities/BookType";
import { RentalsUserType } from "@/entities/RentalsUserType";
import { UserType } from "@/entities/UserType";

import { getAllBooks, getRentedBooksWithUsers } from "@/entities/book";
import { prisma } from "@/entities/db";
import { getAllUsers } from "@/entities/user";

import { getBookFromID } from "@/utils/getBookFromID";

import MuiAlert, { AlertProps } from "@mui/material/Alert";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import useSWR from "swr";

interface RentalPropsType {
  books: Array<BookType>;
  users: Array<UserType>;
  rentals: Array<RentalsUserType>;
  extensionDays: number;
  bookSortBy: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Rental({
  books,
  users,
  rentals,
  extensionDays,
  bookSortBy,
}: RentalPropsType) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [userExpanded, setUserExpanded] = useState<number | false>(false);

  const bookFocusRef = useRef<HTMLInputElement>(null);
  const handleBookSearchSetFocus = () => {
    bookFocusRef.current?.focus();
    bookFocusRef.current?.select();
  };

  const userFocusRef = useRef<HTMLInputElement>(null);
  const handleUserSearchSetFocus = () => {
    userFocusRef.current?.focus();
    userFocusRef.current?.select();
  };

  const { data } = useSWR(
    process.env.NEXT_PUBLIC_API_URL + "/api/rental",
    fetcher,
    { refreshInterval: 1000 }
  );
  // Live-update lists when SWR has fresh data
  if (data) {
    rentals = data.rentals;
    books = data.books;
    users = data.users;
  }

  const handleReturnBookButton = (bookid: number, userid: number) => {
    fetch("/api/book/" + bookid + "/user/" + userid, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          enqueueSnackbar(
            "Leider hat es nicht geklappt, der Server ist aber erreichbar",
            { variant: "error" }
          );
        }
        return res.json();
      })
      .then(() => {
        enqueueSnackbar(
          "Buch - " + getBookFromID(bookid, books).title + " - zurückgegeben"
        );
      })
      .catch(() => {
        enqueueSnackbar(
          "Server ist leider nicht erreichbar. Alles OK mit dem Internet?",
          { variant: "error" }
        );
      });
    handleBookSearchSetFocus();
  };

  const newDueDate = extendDays(new Date(), extensionDays);

  const handleExtendBookButton = (bookid: number, book: BookType) => {
    const newbook = replaceBookStringDate(book) as any;

    if (sameDay(newbook.dueDate, newDueDate)) {
      enqueueSnackbar(
        "Buch - " +
          book.title +
          " - ist bereits bis zum maximalen Ende ausgeliehen",
        { variant: "warning" }
      );
      return;
    }
    newbook.renewalCount = newbook.renewalCount + 1;
    newbook.dueDate = newDueDate.toDate();

    delete newbook.user; // not needed for update
    delete newbook._id; // SWR helper id; not needed for update

    fetch("/api/book/" + bookid, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newbook),
    })
      .then((res) => {
        if (!res.ok) {
          enqueueSnackbar(
            "Leider hat es nicht geklappt, der Server ist aber erreichbar",
            { variant: "error" }
          );
        }
        return res.json();
      })
      .then(() => {
        enqueueSnackbar("Buch - " + book.title + " - verlängert");
      })
      .catch(() => {
        enqueueSnackbar(
          "Server ist leider nicht erreichbar. Alles OK mit dem Internet?",
          { variant: "error" }
        );
      });
    handleBookSearchSetFocus();
  };

  const handleRentBookButton = (bookid: number, userid: number) => {
    fetch("/api/book/" + bookid + "/user/" + userid, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          enqueueSnackbar(
            "Leider hat es nicht geklappt, der Server ist aber erreichbar",
            { variant: "error" }
          );
        }
        return res.json();
      })
      .then(() => {
        enqueueSnackbar(
          "Buch " + getBookFromID(bookid, books).title + " ausgeliehen"
        );
      })
      .catch(() => {
        enqueueSnackbar(
          "Server ist leider nicht erreichbar. Alles OK mit dem Internet?",
          { variant: "error" }
        );
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
        {/* Use sm instead of md so iPad (≥768px) shows two columns.
            Also allow overflow to ensure right-side icons are visible. */}
        <Grid size={{ xs: 12, sm: 6 }} sx={{ overflow: "visible" }}>
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
        <Grid size={{ xs: 12, sm: 6 }} sx={{ overflow: "visible" }}>
          <BookRentalList
            books={books}
            users={users} // to figure out the user name who rented
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
  const extensionDays = Number(process.env.EXTENSION_DURATION_DAYS) || 14;
  const bookSortBy = process.env.RENTAL_SORT_BOOKS || "title_asc";
  const allUsers = await getAllUsers(prisma);

  const users = allUsers.map((u) => {
    const newUser = { ...u } as any; // TODO: tighten type to convert Date -> string
    newUser.createdAt = convertDateToDayString(u.createdAt);
    newUser.updatedAt = convertDateToDayString(u.updatedAt);
    return newUser;
  });

  const allRentals = await getRentedBooksWithUsers(prisma);
  const rentals = allRentals.map((r: any) => {
    // calculate remaining days for the rental
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

  const allBooks = await getAllBooks(prisma);
  const books = allBooks.map((b) => {
    const newBook = { ...b } as any; // TODO: tighten type to convert Date -> string
    newBook.createdAt = convertDateToDayString(b.createdAt);
    newBook.updatedAt = convertDateToDayString(b.updatedAt);
    newBook.rentedDate = b.rentedDate
      ? convertDateToDayString(b.rentedDate)
      : "";
    newBook.dueDate = b.dueDate ? convertDateToDayString(b.dueDate) : "";
    return newBook;
  });

  return { props: { books, users, rentals, extensionDays, bookSortBy } };
}
