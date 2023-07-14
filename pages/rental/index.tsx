import Typography from "@mui/material/Typography";
import Image from "next/image";
import Layout from "@/components/layout/Layout";

import { useRouter } from "next/router";
import BookRentalList from "@/components/rental/BookRentalList";
import {
  convertDateToDayString,
  currentTime,
} from "@/utils/convertDateToDayString";

import { getAllBooks } from "@/entities/book";
import { getAllUsers } from "@/entities/user";
import { PrismaClient } from "@prisma/client";
import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import RentalSearchBar from "@/components/rental/RentalSearchBar";

interface RentalPropsType {
  books: Array<BookType>;
  users: Array<UserType>;
}

const prisma = new PrismaClient();

export default function Rental({ books, users }: RentalPropsType) {
  const router = useRouter();

  return (
    <Layout>
      <Typography variant="h1">Wird noch gebaut</Typography>
      <RentalSearchBar books={books} users={users}></RentalSearchBar>
      <BookRentalList books={books.slice(0, 100)}></BookRentalList>
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

    return newBook;
  });

  return { props: { books, users } };
}
