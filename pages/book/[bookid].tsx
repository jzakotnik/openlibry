import BookEditForm from "@/components/book/BookEditForm";
import Layout from "@/components/layout/Layout";
import { getAllTopics, getBook } from "@/entities/book";
import { BookType } from "@/entities/BookType";
import { prisma } from "@/entities/db";
import { UserType } from "@/entities/UserType";
import {
  convertStringToDay,
  replaceBookDateString,
} from "@/lib/utils/dateutils";
import { Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next/types";
import { useSnackbar } from "notistack";
import { useCallback, useEffect, useState } from "react";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
  },
});

interface BookDetailProps {
  user: UserType;
  book: BookType;
  topics: string[];
  deleteSafetySeconds: number;
}

export default function BookDetail({
  user,
  book,
  topics,
  deleteSafetySeconds,
}: BookDetailProps) {
  const router = useRouter();
  const [bookData, setBookData] = useState<BookType>(book);
  const [antolinResults, setAntolinResults] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // keep local state in sync with prop
    setBookData(book);

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`/api/antolin/${book.id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });
        if (!res.ok) {
          console.error("ERROR while getting Antolin Data", res.statusText);
          return;
        }
        const antolin = await res.json();
        setAntolinResults(antolin as any);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Fetch failed", err);
        }
      }
    })();

    // abort fetch if component unmounts or book changes mid-flight
    return () => controller.abort();
  }, [book]);

  if (!router.query.bookid) {
    return <Typography>ID not found</Typography>;
  }

  const bookid = parseInt(
    Array.isArray(router.query.bookid)
      ? router.query.bookid[0]
      : router.query.bookid,
  );

  const handleSaveButton = useCallback(async () => {
    setIsSaving(true);

    const rentedDate = convertStringToDay(bookData.rentedDate as string);
    const dueDate = convertStringToDay(bookData.dueDate as string);

    const { updatedAt, createdAt, ...savingBook } = bookData;

    try {
      const res = await fetch(`/api/book/${bookid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...savingBook, rentedDate, dueDate }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("ERROR while saving book", res.statusText, errorData);
        enqueueSnackbar(
          errorData.message || "Fehler beim Speichern des Buches",
          { variant: "error" },
        );
        return;
      }

      await res.json();
      enqueueSnackbar(`Buch "${bookData.title}" gespeichert, gut gemacht!`);
      router.push("/book");
    } catch (error) {
      console.error("Failed to save book:", error);
      enqueueSnackbar("Fehler beim Speichern des Buches", { variant: "error" });
    } finally {
      setIsSaving(false);
    }
  }, [bookData, bookid, router, enqueueSnackbar]);

  const handleReturnBookButton = useCallback(
    async (userid: number) => {
      try {
        const res = await fetch(`/api/book/${bookid}/user/${userid}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        enqueueSnackbar("Buch zurückgegeben, super!");
      } catch (error) {
        console.error("Failed to return book:", error);
        enqueueSnackbar("Fehler beim Zurückgeben des Buches", {
          variant: "error",
        });
      }
    },
    [bookid, enqueueSnackbar],
  );

  const handleDeleteButton = useCallback(async () => {
    try {
      const res = await fetch(`/api/book/${bookid}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      enqueueSnackbar("Buch gelöscht");
      router.push("/book");
    } catch (error) {
      console.error("Failed to delete book:", error);
      enqueueSnackbar("Fehler beim Löschen des Buches", { variant: "error" });
    }
  }, [bookid, router, enqueueSnackbar]);

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <BookEditForm
          book={bookData}
          setBookData={setBookData}
          isNewBook={false}
          deleteBook={handleDeleteButton}
          deleteSafetySeconds={deleteSafetySeconds}
          saveBook={handleSaveButton}
          topics={topics}
          antolinResults={antolinResults}
          isSaving={isSaving}
        />
      </ThemeProvider>
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const deleteSafetySeconds = parseInt(
    process.env.DELETE_SAFETY_SECONDS || "5",
    10,
  );

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
          if (filteredTopic.length > 0) {
            redundanttopics.push(filteredTopic);
          }
        });
      }
    });

    // Remove duplicates
    redundanttopics.forEach((element: string) => {
      if (!topics.includes(element)) {
        topics.push(element);
      }
    });
  }

  const book = replaceBookDateString(dbbook as any);

  if (!("id" in book) || !book.id) {
    return {
      notFound: true,
    };
  }

  // Pass data to the page via props
  return { props: { book, topics, deleteSafetySeconds } };
}
