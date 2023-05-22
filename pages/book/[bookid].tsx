import { createTheme, ThemeProvider } from "@mui/material/styles";

import Layout from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { getBook } from "../../entities/book";

import { getRentedBooksForUser } from "@/entities/book";

import { useRouter } from "next/router";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { forwardRef } from "react";

import {
  convertDateToDayString,
  replaceUserDateString,
  replaceBookDateString,
} from "@/utils/convertDateToDayString";
import { PrismaClient } from "@prisma/client";

import BookEditForm from "@/components/book/BookEditForm";
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

export default function BookDetail({ user, book }: any) {
  const router = useRouter();

  const [bookData, setBookData] = useState(book);
  const [returnBookSnackbar, setReturnBookSnackbar] = useState(false);

  useEffect(() => {
    setBookData(book);
  }, []);

  if (!router.query.bookid) {
    return <Typography>ID not found</Typography>;
  }

  const bookid = parseInt(
    Array.isArray(router.query.bookid)
      ? router.query.bookid[0]
      : router.query.bookid
  );

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
    console.log("Saving book ", bookData);

    //we don't need to update the dates
    const { updatedAt, createdAt, ...savingBook } = bookData;

    fetch("/api/book/" + bookid, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(savingBook),
    })
      .then((res) => res.json())
      .then((data) => {});
  };

  const handleReturnBookButton = (userid: number) => {
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
    console.log("Deleting book ", bookData);

    fetch("/api/book/" + bookid, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Delete operation performed on ", bookid, data);
        router.push("/user");
      });
  };

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <BookEditForm
          user={user}
          book={bookData}
          setBookData={setBookData}
          deleteBook={handleDeleteButton}
          saveBook={handleSaveButton}
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

  const dbbook = await getBook(prisma, parseInt(context.query.bookid));

  if (!dbbook) return;

  const book = replaceBookDateString(dbbook);

  if (!("id" in book) || !book.id) return; //shouldn't happen

  // Pass data to the page via props
  return { props: { book } };
}
