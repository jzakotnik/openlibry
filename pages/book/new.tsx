import BookEditForm from "@/components/book/BookEditForm";
import Layout from "@/components/layout/Layout";
import { getAllTopics } from "@/entities/book";
import { BookType } from "@/entities/BookType";
import { prisma } from "@/entities/db";
import {
  fetchCoverFromOpenLibrary,
  uploadCoverBlob,
} from "@/lib/utils/coverutils";
import { currentTime } from "@/lib/utils/dateutils";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next/types";
import { useSnackbar } from "notistack";
import { useCallback, useEffect, useRef, useState } from "react";

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
 * Cover data stored in memory until book is saved
 */
interface CoverData {
  blob: Blob;
  previewUrl: string;
}

/**
 * New Book Creation Page
 *
 * This page allows creating a new book without immediately persisting it to the database.
 * The book data is held in memory until the user explicitly saves it.
 * This prevents creating orphan/empty books when users accidentally click "New Book".
 *
 * Cover images are fetched and stored in memory, then uploaded after the book is created.
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
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  // Cover stored in memory until save
  const [coverData, setCoverData] = useState<CoverData | null>(null);

  // Track if autofill was attempted (to show appropriate message)
  const [autofillAttempted, setAutofillAttempted] = useState(false);

  // Track if we need to cleanup the preview URL
  const coverPreviewUrlRef = useRef<string | null>(null);

  // Cleanup preview URL on unmount or when cover changes
  useEffect(() => {
    return () => {
      if (coverPreviewUrlRef.current) {
        URL.revokeObjectURL(coverPreviewUrlRef.current);
      }
    };
  }, []);

  /**
   * Handle ISBN autofill - fetches book data AND cover in parallel
   */
  const handleAutoFill = useCallback(
    async (isbn: string) => {
      if (!isbn) {
        enqueueSnackbar("Bitte geben Sie eine ISBN ein.", {
          variant: "warning",
        });
        return;
      }

      const cleanedIsbn = isbn.replace(/[^0-9X]/gi, "");
      if (!cleanedIsbn) {
        enqueueSnackbar("Die ISBN ist ungültig (keine Zahlen gefunden).", {
          variant: "warning",
        });
        return;
      }

      setIsAutoFilling(true);

      try {
        // Fetch book data and cover in parallel (like batch scan)
        const [bookResponse, coverResult] = await Promise.all([
          fetch(`/api/book/FillBookByIsbn?isbn=${cleanedIsbn}`),
          fetchCoverFromOpenLibrary(cleanedIsbn),
        ]);

        // Handle book data
        if (bookResponse.ok) {
          const data = await bookResponse.json();
          setBookData((prev) => ({
            ...prev,
            ...data,
            isbn: cleanedIsbn,
          }));

          // Handle cover
          if (coverResult.exists && coverResult.blob) {
            // Cleanup old preview URL if exists
            if (coverPreviewUrlRef.current) {
              URL.revokeObjectURL(coverPreviewUrlRef.current);
            }

            const previewUrl = URL.createObjectURL(coverResult.blob);
            coverPreviewUrlRef.current = previewUrl;

            setCoverData({
              blob: coverResult.blob,
              previewUrl,
            });

            enqueueSnackbar(
              "Stammdaten und Cover wurden erfolgreich geladen.",
              { variant: "success" },
            );
          } else {
            enqueueSnackbar("Stammdaten wurden erfolgreich ausgefüllt.", {
              variant: "success",
            });
          }

          setAutofillAttempted(true);
        } else {
          // Book data not found, but maybe we found a cover
          if (coverResult.exists && coverResult.blob) {
            if (coverPreviewUrlRef.current) {
              URL.revokeObjectURL(coverPreviewUrlRef.current);
            }

            const previewUrl = URL.createObjectURL(coverResult.blob);
            coverPreviewUrlRef.current = previewUrl;

            setCoverData({
              blob: coverResult.blob,
              previewUrl,
            });

            enqueueSnackbar(
              "Stammdaten nicht gefunden, aber Cover ist verfügbar.",
              { variant: "warning" },
            );
          } else {
            enqueueSnackbar(
              "Stammdaten wurden leider nicht gefunden mit dieser ISBN.",
              { variant: "error" },
            );
          }

          setAutofillAttempted(true);
        }
      } catch (e: any) {
        enqueueSnackbar(e?.message || "Fehler beim Laden der Buchdaten.", {
          variant: "error",
        });
      } finally {
        setIsAutoFilling(false);
      }
    },
    [enqueueSnackbar],
  );

  /**
   * Handle save: Creates the book in the database, then uploads cover if available
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
      // Step 1: Create the book
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

      // Step 2: Upload cover if we have one in memory
      let coverUploaded = false;
      if (coverData?.blob) {
        coverUploaded = await uploadCoverBlob(data.id, coverData.blob);
        if (!coverUploaded) {
          // Non-fatal: book was created but cover upload failed
          enqueueSnackbar(
            "Buch erstellt, aber Cover konnte nicht hochgeladen werden.",
            { variant: "warning" },
          );
        }
      }

      const coverInfo = coverUploaded ? " (mit Cover)" : "";
      enqueueSnackbar(
        `Buch "${bookData.title}" erfolgreich erstellt${coverInfo}!`,
        {
          variant: "success",
        },
      );

      // Navigate to the book list (or edit page if you prefer)
      router.push("/book");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      enqueueSnackbar(`Buch konnte nicht erstellt werden: ${message}`, {
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }, [bookData, coverData, router, enqueueSnackbar]);

  /**
   * Handle cancel: Navigate back without saving
   */
  const handleCancel = useCallback(() => {
    // Cleanup preview URL
    if (coverPreviewUrlRef.current) {
      URL.revokeObjectURL(coverPreviewUrlRef.current);
    }
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
          // Cover handling for new books
          coverPreviewUrl={coverData?.previewUrl}
          autofillAttempted={autofillAttempted}
          onAutoFill={handleAutoFill}
          isAutoFilling={isAutoFilling}
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
