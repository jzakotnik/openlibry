import Layout from "@/components/layout/Layout";
import BookRentalList from "@/components/rental/BookRentalList";
import UserRentalList from "@/components/rental/UserRentalList";
import { BookType } from "@/entities/BookType";
import { RentalsUserType } from "@/entities/RentalsUserType";
import { UserType } from "@/entities/UserType";
import { getAllBooks, getRentedBooksWithUsers } from "@/entities/book";
import { prisma, reconnectPrisma } from "@/entities/db";
import { getAllUsers } from "@/entities/user";
import { getRentalConfig } from "@/lib/config/rentalConfig";
import { convertDateToDayString } from "@/lib/utils/dateutils";
import { getBookFromID } from "@/lib/utils/lookups";
import { extendBookApi } from "@/lib/utils/rentalUtils";
import dayjs from "dayjs";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

interface RentalPropsType {
  books: Array<BookType>;
  users: Array<UserType>;
  rentals: Array<RentalsUserType>;
  extensionDays: number;
  maxExtensions: number;
  bookSortBy: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Rental({
  books: initialBooks,
  users: initialUsers,
  rentals: initialRentals,
  extensionDays,
  maxExtensions,
  bookSortBy,
}: RentalPropsType) {
  const [userExpanded, setUserExpanded] = useState<number | false>(false);

  const bookFocusRef = useRef<HTMLInputElement>(null);
  const handleBookSearchSetFocus = () => {
    bookFocusRef.current?.focus({ preventScroll: true });
    bookFocusRef.current?.select();
  };

  const userFocusRef = useRef<HTMLInputElement>(null);
  const handleUserSearchSetFocus = () => {
    userFocusRef.current?.focus({ preventScroll: true });
    userFocusRef.current?.select();
  };

  const { data } = useSWR("/api/rental", fetcher, { refreshInterval: 1000 });

  const books = data?.books ?? initialBooks;
  const users = data?.users ?? initialUsers;
  const rentals = data?.rentals ?? initialRentals;

  const handleReturnBookButton = async (bookid: number, userid: number) => {
    try {
      const res = await fetch(`/api/book/${bookid}/user/${userid}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        toast.error(
          "Leider hat es nicht geklappt, der Server ist aber erreichbar",
        );
        return;
      }

      await res.json();
      toast.success(
        `Buch - ${getBookFromID(bookid, books).title} - zurückgegeben`,
      );
      handleBookSearchSetFocus();
    } catch {
      toast.error(
        "Server ist leider nicht erreichbar. Alles OK mit dem Internet?",
      );
    }
  };

  const handleExtendBookButton = async (bookid: number, book: BookType) => {
    const result = await extendBookApi(bookid);

    if (result.status === "already_extended") {
      toast.warning(
        `Buch - ${book.title} - ist bereits bis zum maximalen Ende ausgeliehen`,
      );
      return;
    }
    if (result.status === "error") {
      toast.error(
        "Leider hat es nicht geklappt, der Server ist aber erreichbar",
      );
      return;
    }

    toast.success(`Buch - ${book.title} - verlängert`);
    handleBookSearchSetFocus();
    // No need to use result.newDueDate here — SWR will refresh the data automatically
  };

  const handleRentBookButton = async (bookid: number, userid: number) => {
    try {
      const res = await fetch(`/api/book/${bookid}/user/${userid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        toast.error(
          "Leider hat es nicht geklappt, der Server ist aber erreichbar",
        );
        return;
      }

      await res.json();
      toast.success(`Buch ${getBookFromID(bookid, books).title} ausgeliehen`);
      handleBookSearchSetFocus();
    } catch {
      toast.error(
        "Server ist leider nicht erreichbar. Alles OK mit dem Internet?",
      );
    }
  };

  return (
    <Layout>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2 px-2"
        style={{ overflow: "visible" }}
        data-cy="rental_page_container"
      >
        <div style={{ overflow: "visible" }} data-cy="rental_user_column">
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
            extensionDurationDays={extensionDays}
            maxExtensions={maxExtensions}
          />
        </div>
        <div style={{ overflow: "visible" }} data-cy="rental_book_column">
          <BookRentalList
            books={books}
            users={users}
            handleExtendBookButton={handleExtendBookButton}
            handleReturnBookButton={handleReturnBookButton}
            handleRentBookButton={handleRentBookButton}
            userExpanded={userExpanded}
            searchFieldRef={bookFocusRef}
            handleUserSearchSetFocus={handleUserSearchSetFocus}
            extensionDurationDays={extensionDays}
            maxExtensions={maxExtensions}
            sortBy={bookSortBy}
          />
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  if (process.env.NODE_ENV !== "production") {
    await reconnectPrisma();
  }

  context.res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  );
  context.res.setHeader("Pragma", "no-cache");
  context.res.setHeader("Expires", "0");

  const { extensionDays, maxExtensions } = getRentalConfig();
  const bookSortBy = process.env.RENTAL_SORT_BOOKS || "title_asc";

  const allUsers = await getAllUsers(prisma);
  const users = allUsers.map((u) => {
    const newUser = { ...u } as any;
    newUser.createdAt = convertDateToDayString(u.createdAt);
    newUser.updatedAt = convertDateToDayString(u.updatedAt);
    return newUser;
  });

  const allRentals = await getRentedBooksWithUsers(prisma);
  const rentals = allRentals.map((r: any) => {
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
    const newBook = { ...b } as any;
    newBook.createdAt = convertDateToDayString(b.createdAt);
    newBook.updatedAt = convertDateToDayString(b.updatedAt);
    newBook.rentedDate = b.rentedDate
      ? convertDateToDayString(b.rentedDate)
      : "";
    newBook.dueDate = b.dueDate ? convertDateToDayString(b.dueDate) : "";
    return newBook;
  });

  return {
    props: { books, users, rentals, extensionDays, maxExtensions, bookSortBy },
  };
};
