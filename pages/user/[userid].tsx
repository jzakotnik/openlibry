import { createTheme, ThemeProvider } from "@mui/material/styles";

import Layout from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { getUser } from "../../entities/user";

import { getRentedBooksForUser } from "@/entities/book";

import { useRouter } from "next/router";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { forwardRef } from "react";

import {
  convertDateToDayString,
  replaceUserDateString,
} from "@/utils/convertDateToDayString";
import { PrismaClient } from "@prisma/client";

import UserEditForm from "@/components/user/UserEditForm";
import { Typography } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
  },
});

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function UserDetail({ user, books }: any) {
  const router = useRouter();

  const [userData, setUserData] = useState(user);
  const [returnBookSnackbar, setReturnBookSnackbar] = useState(false);

  useEffect(() => {
    setUserData(user);
  }, []);

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

  const handleCloseReturnBookSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setReturnBookSnackbar(false);
  };

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
      .then((data) => {});
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
        setReturnBookSnackbar(true);
      });
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
        router.push("/user");
      });
  };

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <UserEditForm
          user={userData}
          books={books}
          setUserData={setUserData}
          deleteUser={handleDeleteButton}
          saveUser={handleSaveButton}
          returnBook={handleReturnBookButton}
        />
        <Snackbar
          open={returnBookSnackbar}
          autoHideDuration={8000}
          onClose={handleCloseReturnBookSnackbar}
        >
          <Alert
            onClose={handleCloseReturnBookSnackbar}
            severity="success"
            sx={{ width: "100%" }}
          >
            Buch zurück gegeben, super!
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </Layout>
  );
}

export async function getServerSideProps(context: any) {
  const prisma = new PrismaClient();

  const dbuser = await getUser(prisma, parseInt(context.query.userid));

  if (!dbuser) return;

  const user = replaceUserDateString(dbuser);

  if (!("id" in user) || !user.id) return; //shouldn't happen

  const allBooks = (await getRentedBooksForUser(prisma, user.id)) as any;

  //TODO fix the type for book incl user

  console.log("User, Books", user, allBooks);
  const books = allBooks.map((b: any) => {
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

  // Pass data to the page via props
  return { props: { user, books } };
}
