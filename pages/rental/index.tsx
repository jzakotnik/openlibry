import Typography from "@mui/material/Typography";
import Image from "next/image";
import Layout from "@/components/layout/Layout";

import { useRouter } from "next/router";
import BookRentalList from "@/components/rental/BookRentalList";
import {
  convertDateToDayString,
  currentTime,
} from "@/utils/convertDateToDayString";

import dayjs from "dayjs";
import { getAllUsers } from "@/entities/user";
import { PrismaClient } from "@prisma/client";
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

export default function Rental({ books, users, rentals }: RentalPropsType) {
  const router = useRouter();

  return (
    <Layout>
      <Typography variant="h1">Wird noch gebaut</Typography>

      <UserRentalList users={users} books={books} rentals={rentals} />
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
