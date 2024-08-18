import { createTheme, ThemeProvider } from "@mui/material/styles";

import Layout from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { getAllTopics, getBook } from "../../entities/book";

import MuiAlert, { AlertProps } from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useRouter } from "next/router";
import { forwardRef } from "react";

import { convertStringToDay, replaceBookDateString } from "@/utils/dateutils";
import { PrismaClient } from "@prisma/client";

import BookEditForm from "@/components/book/BookEditForm";
import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import { Typography } from "@mui/material";
import Head from "next/head";
import { GetServerSidePropsContext } from "next/types";

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

interface BookDetailProps {
  user: UserType;
  book: BookType;
  topics: string[];
}

export default function BookDetail({ user, book, topics }: BookDetailProps) {
  const router = useRouter();

  const [bookData, setBookData] = useState<BookType>(book);
  const [antolinResults, setAntolinResults] = useState(null);
  const [returnBookSnackbar, setReturnBookSnackbar] = useState(false);
  const [saveBookSnackbar, setSaveBookSnackbar] = useState(false);

  useEffect(() => {
    setBookData(book);
    fetch("/api/antolin/" + book.id, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => {
      if (!res.ok) {
        console.log("ERROR while getting Antolin Data", res.statusText);
      }
      //console.log("Retrieved Antolin data for book", book.title);
      res.json().then((antolin) => {
        //console.log("Antolin data", antolin);
        setAntolinResults(antolin as any);
      });
    });
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

  const handleCloseSaveBookSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setSaveBookSnackbar(false);
  };

  const handleSaveButton = () => {
    console.log("Saving book ", bookData);

    const rentedDate = convertStringToDay(bookData.rentedDate as string);
    const dueDate = convertStringToDay(bookData.dueDate as string);

    //we don't need to update the dates
    const { updatedAt, createdAt, ...savingBook } = bookData;

    fetch("/api/book/" + bookid, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...savingBook, rentedDate, dueDate }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSaveBookSnackbar(true);
      });
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
        router.push("/book");
      });
  };

  return (
    <div>
      <Head>
        {" "}
        <title>{book.title}</title>
      </Head>
      <Layout>
        <ThemeProvider theme={theme}>
          <BookEditForm
            book={bookData}
            setBookData={setBookData}
            deleteBook={handleDeleteButton}
            saveBook={handleSaveButton}
            topics={topics}
            antolinResults={antolinResults}
          />
          <Snackbar
            open={returnBookSnackbar}
            autoHideDuration={4000}
            onClose={handleCloseReturnBookSnackbar}
          >
            <Alert
              onClose={handleCloseReturnBookSnackbar}
              severity="success"
              sx={{ width: "100%" }}
            >
              Buch zurückgegeben, super!
            </Alert>
          </Snackbar>
          <Snackbar
            open={saveBookSnackbar}
            autoHideDuration={4000}
            onClose={handleCloseSaveBookSnackbar}
          >
            <Alert
              onClose={handleCloseSaveBookSnackbar}
              severity="success"
              sx={{ width: "100%" }}
            >
              Buch gespeichert, gut gemacht!
            </Alert>
          </Snackbar>
        </ThemeProvider>
      </Layout>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const prisma = new PrismaClient();

  const dbbook = await getBook(prisma, parseInt(context.query.bookid as any));
  if (!dbbook) {
    return {
      notFound: true,
    };
  }

  const dbtopics = await getAllTopics(prisma);
  const topics: string[] = [];
  if (dbtopics != null) {
    const redundanttopics: string[] = [];
    dbtopics.map((t) => {
      if ("topics" in t && t.topics != null) {
        const singletopics = t.topics.split(";");
        singletopics.map((s) => {
          const filteredTopic = s.trim();
          s.trim().length > 0 ? redundanttopics.push(s) : 0;
        });
      }
    });

    //const topics = [...new Set(redundanttopics)];

    redundanttopics.map((element: string) => {
      if (!topics.includes(element)) {
        topics.push(element);
      }
    });
  }

  //console.log("Found these topics:", topics);

  if (!dbbook) return;

  const book = replaceBookDateString(dbbook as any);
  //console.log("Replaced date string", book, dbbook);
  //const imagesArray = await getImages();
  //console.log("Images", imagesArray);
  //push array to object for performance reasons
  //const images = {};
  //imagesArray.map((i) => ((images as any)[i] = "1"));

  if (!("id" in book) || !book.id) return; //shouldn't happen

  // Pass data to the page via props
  return { props: { book, topics } };
}
