import Layout from "@/components/layout/Layout";
import BookRentalList from "@/components/rental/BookRentalList";
import UserRentalList from "@/components/rental/UserRentalList";
import { BookType } from "@/entities/BookType";
import { RentalsUserType } from "@/entities/RentalsUserType";
import { UserType } from "@/entities/UserType";
import { getAllBooks, getRentedBooksWithUsers } from "@/entities/book";
import { prisma, reconnectPrisma } from "@/entities/db";
import { getAllUsers } from "@/entities/user";
import {
  convertDateToDayString,
  extendDays,
  replaceBookStringDate,
  sameDay,
} from "@/lib/utils/dateutils";
import { getBookFromID } from "@/lib/utils/lookups";
import Grid from "@mui/material/Grid";
import dayjs from "dayjs";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { useRef, useState } from "react";
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
  books: initialBooks,
  users: initialUsers,
  rentals: initialRentals,
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

  // Use SWR for live updates
  const { data } = useSWR("/api/rental", fetcher, { refreshInterval: 1000 });

  // Use live data if available, otherwise fall back to initial props
  const books = data?.books ?? initialBooks;
  const users = data?.users ?? initialUsers;
  const rentals = data?.rentals ?? initialRentals;

  const handleReturnBookButton = async (bookid: number, userid: number) => {
    try {
      const res = await fetch(`/api/book/${bookid}/user/${userid}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        enqueueSnackbar(
          "Leider hat es nicht geklappt, der Server ist aber erreichbar",
          { variant: "error" },
        );
        return;
      }

      await res.json();
      enqueueSnackbar(
        `Buch - ${getBookFromID(bookid, books).title} - zurückgegeben`,
      );
      handleBookSearchSetFocus();
    } catch (error) {
      enqueueSnackbar(
        "Server ist leider nicht erreichbar. Alles OK mit dem Internet?",
        { variant: "error" },
      );
    }
  };

  const newDueDate = extendDays(new Date(), extensionDays);

  const handleExtendBookButton = async (bookid: number, book: BookType) => {
    const newbook = replaceBookStringDate(book) as any;

    if (sameDay(newbook.dueDate, newDueDate)) {
      enqueueSnackbar(
        `Buch - ${book.title} - ist bereits bis zum maximalen Ende ausgeliehen`,
        { variant: "warning" },
      );
      return;
    }

    newbook.renewalCount = newbook.renewalCount + 1;
    newbook.dueDate = newDueDate.toDate();

    delete newbook.user; // not needed for update
    delete newbook._id; // SWR helper id; not needed for update

    try {
      const res = await fetch(`/api/book/${bookid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newbook),
      });

      if (!res.ok) {
        enqueueSnackbar(
          "Leider hat es nicht geklappt, der Server ist aber erreichbar",
          { variant: "error" },
        );
        return;
      }

      await res.json();
      enqueueSnackbar(`Buch - ${book.title} - verlängert`);
      handleBookSearchSetFocus();
    } catch (error) {
      enqueueSnackbar(
        "Server ist leider nicht erreichbar. Alles OK mit dem Internet?",
        { variant: "error" },
      );
    }
  };

  const handleRentBookButton = async (bookid: number, userid: number) => {
    try {
      const res = await fetch(`/api/book/${bookid}/user/${userid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        enqueueSnackbar(
          "Leider hat es nicht geklappt, der Server ist aber erreichbar",
          { variant: "error" },
        );
        return;
      }

      await res.json();
      enqueueSnackbar(`Buch ${getBookFromID(bookid, books).title} ausgeliehen`);
      handleBookSearchSetFocus();
    } catch (error) {
      enqueueSnackbar(
        "Server ist leider nicht erreichbar. Alles OK mit dem Internet?",
        { variant: "error" },
      );
    }
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
        data-cy="rental_page_container"
      >
        {/* Use sm instead of md so iPad (≥768px) shows two columns.
            Also allow overflow to ensure right-side icons are visible. */}
        <Grid
          size={{ xs: 12, sm: 6 }}
          sx={{ overflow: "visible" }}
          data-cy="rental_user_column"
        >
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
        <Grid
          size={{ xs: 12, sm: 6 }}
          sx={{ overflow: "visible" }}
          data-cy="rental_book_column"
        >
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

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  // In test/dev environment, force fresh Prisma connection
  if (process.env.NODE_ENV !== "production") {
    await reconnectPrisma();
  }

  // Disable all caching
  context.res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  );
  context.res.setHeader("Pragma", "no-cache");
  context.res.setHeader("Expires", "0");

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
      lastName: r.user?.lastName ?? null,
      firstName: r.user?.firstName ?? null,
      remainingDays: diff,
      dueDate: convertDateToDayString(due.toDate()),
      renewalCount: r.renewalCount,
      userid: r.user?.id ?? null,
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
};
