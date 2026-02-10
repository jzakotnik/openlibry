import { AntolinResultType } from "@/entities/AntolinResultsType";
import { BookType } from "@/entities/BookType";
import { uploadCoverBlob } from "@/lib/utils/coverutils";
import { convertStringToDay } from "@/lib/utils/dateutils";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { useCallback, useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CoverData {
  blob: Blob;
  previewUrl: string;
}

type BookEditorMode =
  | { kind: "new"; initialIsbn?: string }
  | { kind: "edit"; book: BookType };

/**
 * Everything the BookEditForm (and the thin page wrapper) needs.
 */
export interface UseBookEditorReturn {
  bookData: BookType;
  setBookData: React.Dispatch<React.SetStateAction<BookType>>;
  isSaving: boolean;
  antolinResults: AntolinResultType | null;

  handleSave: () => Promise<void>;
  handleDelete: () => Promise<void>;
  handleReturnBook: (userid: number) => Promise<void>;
  handleCancel: () => void;

  // New-book-specific cover & autofill state
  coverPreviewUrl?: string;
  autofillAttempted: boolean;
  isAutoFilling: boolean;
  handleAutoFill: (isbn: string) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function fetchCoverFromApi(
  isbn: string,
): Promise<{ exists: boolean; blob?: Blob; source?: string }> {
  try {
    const response = await fetch(`/api/book/fetchCover?isbn=${isbn}`);
    if (!response.ok) return { exists: false };
    const blob = await response.blob();
    const source = response.headers.get("X-Cover-Source") || "unknown";
    return { exists: true, blob, source };
  } catch {
    return { exists: false };
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useBookEditor(mode: BookEditorMode): UseBookEditorReturn {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  // --- Book data state ---------------------------------------------------

  const isNew = mode.kind === "new";
  const bookId = mode.kind === "edit" ? mode.book.id : undefined;

  const [bookData, setBookData] = useState<BookType>(() => {
    if (mode.kind === "edit") return mode.book;
    return {
      title: "",
      subtitle: "",
      author: "",
      renewalCount: 0,
      rentalStatus: "available",
      topics: "",
      rentedDate: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      isbn: mode.initialIsbn || "",
    };
  });

  // Keep local state in sync when the SSR prop changes (edit mode only)
  useEffect(() => {
    if (mode.kind === "edit") {
      setBookData(mode.book);
    }
  }, [mode.kind === "edit" ? mode.book : null]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Saving state ------------------------------------------------------

  const [isSaving, setIsSaving] = useState(false);

  // --- Antolin (edit mode only) ------------------------------------------

  const [antolinResults, setAntolinResults] =
    useState<AntolinResultType | null>(null);

  useEffect(() => {
    if (mode.kind !== "edit" || !mode.book.id) return;

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`/api/antolin/${mode.book.id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });
        if (!res.ok) {
          console.error("ERROR while getting Antolin Data", res.statusText);
          return;
        }
        const antolin = await res.json();
        setAntolinResults(antolin as AntolinResultType);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Antolin fetch failed", err);
        }
      }
    })();

    return () => controller.abort();
  }, [mode.kind === "edit" ? mode.book.id : null]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Cover state (new-book mode) ----------------------------------------

  const [coverData, setCoverData] = useState<CoverData | null>(null);
  const [autofillAttempted, setAutofillAttempted] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const coverPreviewUrlRef = useRef<string | null>(null);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (coverPreviewUrlRef.current) {
        URL.revokeObjectURL(coverPreviewUrlRef.current);
      }
    };
  }, []);

  // --- Autofill (new-book mode) -------------------------------------------

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
        const [bookResponse, coverResult] = await Promise.all([
          fetch(`/api/book/FillBookByIsbn?isbn=${cleanedIsbn}`),
          fetchCoverFromApi(cleanedIsbn),
        ]);

        // Handle book data
        if (bookResponse.ok) {
          const data = await bookResponse.json();
          setBookData((prev) => ({ ...prev, ...data, isbn: cleanedIsbn }));

          if (coverResult.exists && coverResult.blob) {
            setCoverPreview(coverResult.blob);
            enqueueSnackbar(
              "Stammdaten und Cover wurden erfolgreich geladen.",
              { variant: "success" },
            );
          } else {
            enqueueSnackbar("Stammdaten wurden erfolgreich ausgefüllt.", {
              variant: "success",
            });
          }
        } else {
          // Book data not found – maybe cover still available
          if (coverResult.exists && coverResult.blob) {
            setCoverPreview(coverResult.blob);
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
        }

        setAutofillAttempted(true);
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

  /** Helper: set cover preview blob, cleaning up the old one. */
  function setCoverPreview(blob: Blob) {
    if (coverPreviewUrlRef.current) {
      URL.revokeObjectURL(coverPreviewUrlRef.current);
    }
    const previewUrl = URL.createObjectURL(blob);
    coverPreviewUrlRef.current = previewUrl;
    setCoverData({ blob, previewUrl });
  }

  // --- Save --------------------------------------------------------------

  const handleSave = useCallback(async () => {
    // Validate required fields (applies to both modes now)
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
      if (isNew) {
        await saveNewBook();
      } else {
        await saveExistingBook();
      }
    } finally {
      setIsSaving(false);
    }

    // ------- inner helpers -------

    async function saveNewBook() {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      if (!data.id) throw new Error("Keine Buch-ID in der Antwort erhalten");

      // Upload cover if available
      let coverUploaded = false;
      if (coverData?.blob) {
        coverUploaded = await uploadCoverBlob(data.id, coverData.blob);
        if (!coverUploaded) {
          enqueueSnackbar(
            "Buch erstellt, aber Cover konnte nicht hochgeladen werden.",
            { variant: "warning" },
          );
        }
      }

      const coverInfo = coverUploaded ? " (mit Cover)" : "";
      enqueueSnackbar(
        `Buch "${bookData.title}" erfolgreich erstellt${coverInfo}!`,
        { variant: "success" },
      );
      router.push("/book");
    }

    async function saveExistingBook() {
      const rentedDate = convertStringToDay(bookData.rentedDate as string);
      const dueDate = convertStringToDay(bookData.dueDate as string);
      const { updatedAt, createdAt, ...savingBook } = bookData;

      const res = await fetch(`/api/book/${bookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
    }
  }, [bookData, bookId, isNew, coverData, router, enqueueSnackbar]);

  // --- Delete ------------------------------------------------------------

  const handleDelete = useCallback(async () => {
    if (!bookId) return;

    try {
      const res = await fetch(`/api/book/${bookId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      await res.json();
      enqueueSnackbar("Buch gelöscht");
      router.push("/book");
    } catch (error) {
      console.error("Failed to delete book:", error);
      enqueueSnackbar("Fehler beim Löschen des Buches", { variant: "error" });
    }
  }, [bookId, router, enqueueSnackbar]);

  // --- Return book -------------------------------------------------------

  const handleReturnBook = useCallback(
    async (userid: number) => {
      if (!bookId) return;

      try {
        const res = await fetch(`/api/book/${bookId}/user/${userid}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        await res.json();
        enqueueSnackbar("Buch zurückgegeben, super!");
      } catch (error) {
        console.error("Failed to return book:", error);
        enqueueSnackbar("Fehler beim Zurückgeben des Buches", {
          variant: "error",
        });
      }
    },
    [bookId, enqueueSnackbar],
  );

  // --- Cancel (new-book mode) --------------------------------------------

  const handleCancel = useCallback(() => {
    if (coverPreviewUrlRef.current) {
      URL.revokeObjectURL(coverPreviewUrlRef.current);
    }
    router.push("/book");
  }, [router]);

  // --- Return value -------------------------------------------------------

  return {
    bookData,
    setBookData,
    isSaving,
    antolinResults,

    handleSave,
    handleDelete,
    handleReturnBook,
    handleCancel,

    coverPreviewUrl: coverData?.previewUrl,
    autofillAttempted,
    isAutoFilling,
    handleAutoFill,
  };
}
