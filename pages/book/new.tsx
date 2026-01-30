import BookEditForm from "@/components/book/BookEditForm";
import Layout from "@/components/layout/Layout";
import { getAllTopics } from "@/entities/book";
import { BookType } from "@/entities/BookType";
import { prisma } from "@/entities/db";
import { currentTime } from "@/lib/utils/dateutils";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next/types";
import { useSnackbar } from "notistack";
import { useCallback, useState } from "react";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
  },
});

interface NewBookProps {
  topics: string[];
  deleteSafetySeconds: number;
  initialIsbn?: string;
}

/**
 * New Book Creation Page
 *
 * This page allows creating a new book without immediately persisting it to the database.
 * The book data is held in memory until the user explicitly saves it.
 * This prevents creating orphan/empty books when users accidentally click "New Book".
 */
export default function NewBook({
  topics,
  deleteSafetySeconds,
  initialIsbn,
}: NewBookProps) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  // Initialize with empty book data - not persisted yet
  const [bookData, setBookData] = useState<BookType>(() => ({
    title: "",
    subtitle: "",
    author: "",
    renewalCount: 0,
    rentalStatus: "available",
    topics: "",
    rentedDate: currentTime(),
    dueDate: currentTime(),
    isbn: initialIsbn || "",
  }));

  const [isSaving, setIsSaving] = useState(false);

  /**
   * Handle save: Creates the book in the database for the first time
   */
  const handleSaveBook = useCallback(async () => {
    // Validate required fields
    if (!bookData.title?.trim()) {
      enqueueSnackbar("Bitte geben Sie einen Titel ein.", {
        variant: "warning",
      });
      return;
    }
    if (!bookData.author?.trim()) {
      enqueueSnackbar("Bitte geben Sie einen Autor ein.", {
        variant: "warning",
      });
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Fehler beim Erstellen: ${res.status} ${res.statusText}`,
        );
      }

      const data = await res.json();

      if (!data.id) {
        throw new Error("Keine Buch-ID in der Antwort erhalten");
      }

      enqueueSnackbar(`Buch "${bookData.title}" erfolgreich erstellt!`, {
        variant: "success",
      });

      // Navigate to the edit page for the newly created book
      router.push(`/book/${data.id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      enqueueSnackbar(`Buch konnte nicht erstellt werden: ${message}`, {
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }, [bookData, router, enqueueSnackbar]);

  /**
   * Handle cancel: Navigate back without saving
   */
  const handleCancel = useCallback(() => {
    router.push("/book");
  }, [router]);

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <BookEditForm
          book={bookData}
          setBookData={setBookData}
          isNewBook={true}
          saveBook={handleSaveBook}
          cancelAction={handleCancel}
          deleteBook={() => {}} // No delete for new books
          deleteSafetySeconds={deleteSafetySeconds}
          topics={topics}
          antolinResults={null} // No Antolin lookup for unsaved books
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

  // Get ISBN from query parameter if provided (e.g., from batch scan)
  const initialIsbn = context.query.isbn as string | undefined;

  // Fetch available topics for the autocomplete
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

  return {
    props: {
      topics,
      deleteSafetySeconds,
      initialIsbn: initialIsbn || null,
    },
  };
}
