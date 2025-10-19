import { createTheme, ThemeProvider } from "@mui/material/styles";

import Layout from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { getUser } from "../../entities/user";

import { getRentedBooksForUser } from "@/entities/book";

import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { useRouter } from "next/router";
import { forwardRef } from "react";

import {
  convertDateToDayString,
  extendDays,
  replaceBookStringDate,
  replaceUserDateString,
  sameDay,
} from "@/utils/dateutils";
import { PrismaClient } from "@prisma/client";

import UserEditForm from "@/components/user/UserEditForm";
import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import { Typography } from "@mui/material";
import { GetServerSidePropsContext } from "next/types";
import { useSnackbar } from "notistack";

type UserDetailPropsType = {
  user: UserType;
  books: Array<BookType>;
  extensionDays: number;
};

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
  },
});

const deleteSafetySeconds = process.env.NEXT_PUBLIC_DELETE_SAFETY_SECONDS
  ? parseInt(process.env.NEXT_PUBLIC_DELETE_SAFETY_SECONDS)
  : 3;

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function UserDetail({
  user,
  books,
  extensionDays,
}: UserDetailPropsType) {
  const router = useRouter();

  const [userData, setUserData] = useState(user);
  const [userBooks, setUserBooks] = useState(books);
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    setUserData(user);
  }, [user]);

  if (!router.query.userid) {
    return <Typography>ID not found</Typography>;
  }

  const userid = parseInt(
    Array.isArray(router.query.userid)
      ? router.query.userid[0]
      : router.query.userid
  );
  //console.log("User Page", userid);
  //console.log("User, Books", user, books);

  const handleSaveButton = () => {
    console.log("Saving user ", userData);

    //we don't need to update the dates
    const { updatedAt, createdAt, ...savingUser } = userData;

    fetch("/api/user/" + userid, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(savingUser),
    })
      .then((res) => res.json())
      .then((data) => {
        enqueueSnackbar(
          "Nutzer " +
            userData.firstName +
            " " +
            userData.lastName +
            " gespeichert"
        );
        router.push("/user");
      });
  };

  const handleReturnBookButton = (bookid: number) => {
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
        enqueueSnackbar("Buch zurückgegeben, super!");
      });
  };

  const handleExtendBookButton = (bookid: number, book: BookType) => {
    //we don't need to update the dates

    //console.log("Extended date", book, extendWeeks(book.dueDate as Date, 2));

    const newbook = replaceBookStringDate(book) as any;
    //extend logic

    const newDueDate = extendDays(new Date(), extensionDays);

    if (sameDay(newbook.dueDate, newDueDate)) {
      enqueueSnackbar(
        "Buch - " +
          book.title +
          " - ist bereits bis zum maximalen Ende ausgeliehen",
        { variant: "warning" }
      );
      return;
    }

    newbook.dueDate = newDueDate.toDate();
    newbook.renewalCount = newbook.renewalCount + 1;

    //console.log("Saving an extended book", newbook);
    delete newbook.user; //don't need the user here

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
        enqueueSnackbar("Buch verlängert, super!");
      });
    setUserBooks((userBooks) =>
      userBooks.map((b) =>
        b.id === bookid
          ? {
              ...b,
              renewalCount: b.renewalCount + 1,
              dueDate: newDueDate.toDate(),
            }
          : b
      )
    );
  };

  const handleDeleteButton = () => {
    console.log("Deleting user ", userData);

    fetch("/api/user/" + userid, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Delete operation performed on ", userid, data);
        enqueueSnackbar("Nutzer gelöscht!");
        router.push("/user");
      });
  };

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <UserEditForm
          user={userData}
          books={userBooks}
          setUserData={setUserData}
          deleteUser={handleDeleteButton}
          deleteSafetySeconds={deleteSafetySeconds}
          saveUser={handleSaveButton}
          returnBook={handleReturnBookButton}
          extendBook={handleExtendBookButton}
          initiallyEditable={true}
        />
      </ThemeProvider>
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const extensionDays = process.env.EXTENSION_DURATION_DAYS || 14;
  if (!context.query.userid) return { props: {} };
  const prisma = new PrismaClient();

  const dbuser = await getUser(
    prisma,
    parseInt(context.query.userid as string)
  );

  if (!dbuser) {
    return {
      notFound: true,
    };
  }

  const user = replaceUserDateString(dbuser);

  if (!("id" in user) || !user.id) return; //shouldn't happen

  const allBooks = (await getRentedBooksForUser(prisma, user.id)) as any;

  //TODO fix the type for book incl user

  console.log("User, Books", user, allBooks);
  const books = allBooks.map((b: BookType) => {
    const newBook = { ...b } as any; //define a better type there with conversion of Date to string
    newBook.createdAt = convertDateToDayString(b.createdAt);
    newBook.updatedAt = convertDateToDayString(b.updatedAt);
    newBook.rentedDate = b.rentedDate
      ? convertDateToDayString(b.rentedDate)
      : "";
    newBook.dueDate = b.dueDate ? convertDateToDayString(b.dueDate) : "";
    //temp TODO
    //console.log("Book", newBook);
    return newBook;
  });

  // Pass data to the page via props
  return { props: { user, books, extensionDays } };
}
