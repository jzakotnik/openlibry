import { AntolinResultType } from "@/entities/AntolinResultsType";
import { BookType } from "@/entities/BookType";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { showsSchoolFields } from "@/lib/config/usageContext";
import { t } from "@/lib/i18n";
import { uploadCoverBlob } from "@/lib/utils/coverutils";
import { convertDateToDayString, convertStringToDay } from "@/lib/utils/dateutils";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
  dirty: boolean;
  isSaving: boolean;
  antolinResults: AntolinResultType | null;

  handleSave: () => Promise<void>;
  handleDelete: () => Promise<void>;
  handleReturnBook: (userid: number) => Promise<void>;
  handleAssignUser: (userid: number) => Promise<void>;
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

  // --- Book data state ---------------------------------------------------

  const isNew = mode.kind === "new";
  const bookId = mode.kind === "edit" ? mode.book.id : undefined;

  const [bookData, setBookDataState] = useState<BookType>(() => {
    if (mode.kind === "edit") return mode.book;
    return {
      title: "",
      subtitle: "",
      author: "",
      renewalCount: 0,
      rentalStatus: "available",
      mediaType: "book",
      topics: "",
      rentedDate: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      isbn: mode.initialIsbn || "",
    };
  });

  // --- Dirty tracking / unsaved-changes warning ---------------------------

  const [dirty, setDirty] = useState(false);

  // Every edit made through this setter (exposed to BookEditForm and used
  // for autofill) counts as an unsaved change. Places that sync already-
  // persisted data (SSR prop sync, handleAssignUser) use setBookDataState
  // directly and manage `dirty` themselves instead.
  const setBookData = useCallback<React.Dispatch<React.SetStateAction<BookType>>>(
    (value) => {
      setBookDataState(value);
      setDirty(true);
    },
    [],
  );

  const { allowNextNavigation } = useUnsavedChangesWarning(dirty);

  // Keep local state in sync when the SSR prop changes (edit mode only)
  useEffect(() => {
    if (mode.kind === "edit") {
      setBookDataState(mode.book);
      setDirty(false);
    }
  }, [mode.kind === "edit" ? mode.book : null]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Saving state ------------------------------------------------------

  const [isSaving, setIsSaving] = useState(false);

  // --- Antolin (edit mode only) ------------------------------------------

  const [antolinResults, setAntolinResults] =
    useState<AntolinResultType | null>(null);

  useEffect(() => {
    if (mode.kind !== "edit" || !mode.book.id || !showsSchoolFields()) return;

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

  const handleAutoFill = useCallback(async (isbn: string) => {
    if (!isbn) {
      toast.info(t("bookEditForm.toastEnterIsbn"));
      return;
    }

    const cleanedIsbn = isbn.replace(/[^0-9X]/gi, "");
    if (!cleanedIsbn) {
      toast.info(t("bookEditForm.toastIsbnInvalid"));
      return;
    }

    setIsAutoFilling(true);

    try {
      const [bookResponse, coverResult] = await Promise.all([
        fetch(`/api/book/FillBookByIsbn?isbn=${cleanedIsbn}`),
        fetchCoverFromApi(cleanedIsbn),
      ]);

      // Always read the body — needed for error details even on non-OK responses
      const data = await bookResponse.json();

      if (bookResponse.ok) {
        setBookData((prev) => ({ ...prev, ...data, isbn: cleanedIsbn }));

        if (coverResult.exists && coverResult.blob) {
          setCoverPreview(coverResult.blob);
          toast.success(t("bookEditForm.toastDataAndCoverLoaded"));
        } else {
          toast.success(t("bookEditForm.toastDataLoaded"));
        }
      } else {
        // Surface the translated error + per-service diagnostic from the API
        const headline = data?.error ?? t("bookEditForm.toastIsbnNotFound");
        const details: { service: string; status: string; reason?: string }[] =
          data?.details ?? [];
        const failLines = details
          .filter((d) => d.status === "error")
          .map((d) => `${d.service}: ${d.reason}`)
          .join(" · ");
        const fullMessage = failLines ? `${headline}\n${failLines}` : headline;

        if (coverResult.exists && coverResult.blob) {
          // Cover found even though metadata lookup failed — still useful
          setCoverPreview(coverResult.blob);
          toast.info(fullMessage);
        } else {
          bookResponse.status === 503
            ? toast.error(fullMessage)
            : toast.info(fullMessage);
        }
      }

      setAutofillAttempted(true);
    } catch (e: any) {
      toast.error(e?.message || t("bookEditForm.toastDataLoadError"));
    } finally {
      setIsAutoFilling(false);
    }
  }, []);

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
      toast.info("Bitte geben Sie einen Titel ein.");
      return;
    }
    if (!bookData.author?.trim()) {
      toast.info("Bitte geben Sie einen Autor ein.");
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
          toast.info(
            "Buch erstellt, aber Cover konnte nicht hochgeladen werden.",
          );
        }
      }

      const coverInfo = coverUploaded ? " (mit Cover)" : "";
      toast.success(
        `Buch "${bookData.title}" erfolgreich erstellt${coverInfo}!`,
      );
      setDirty(false);
      allowNextNavigation();
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
        toast.error(errorData.message || "Fehler beim Speichern des Buches");
        return;
      }

      await res.json();
      toast.success(`Buch "${bookData.title}" gespeichert, gut gemacht!`);
      setDirty(false);
      allowNextNavigation();
      router.push("/book");
    }
  }, [bookData, bookId, isNew, coverData, router, allowNextNavigation]);

  // --- Delete ------------------------------------------------------------

  const handleDelete = useCallback(async () => {
    if (!bookId) return;

    try {
      const res = await fetch(`/api/book/${bookId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      await res.json();
      toast.success("Buch gelöscht");
      allowNextNavigation();
      router.push("/book");
    } catch (error) {
      console.error("Failed to delete book:", error);
      toast.error("Fehler beim Löschen des Buches");
    }
  }, [bookId, router, allowNextNavigation]);

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
        toast.success("Buch zurückgegeben, super!");
      } catch (error) {
        console.error("Failed to return book:", error);
        toast.error("Fehler beim Zurückgeben des Buches", {});
      }
    },
    [bookId],
  );

  // --- Assign user ---------------------------------------------------------

  const handleAssignUser = useCallback(
    async (userid: number) => {
      if (!bookId) return;

      try {
        const res = await fetch(`/api/book/${bookId}/user/${userid}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error("Failed to assign user:", data.result);
          toast.error(t("bookUserAssign.toastAssignFailed"));
          return;
        }

        // Merge just the fields rentBook() changed instead of reloading the
        // page - a full reload would wipe any other unsaved edit the user
        // made in this same form (title, author, ...) before assigning.
        const [, updatedBook] = JSON.parse(data.result);
        setBookDataState((prev) => ({
          ...prev,
          rentalStatus: updatedBook.rentalStatus,
          userId: updatedBook.userId,
          renewalCount: updatedBook.renewalCount,
          rentedDate: convertDateToDayString(updatedBook.rentedDate),
          dueDate: convertDateToDayString(updatedBook.dueDate),
        }));
        toast.success(t("bookUserAssign.toastAssigned"));
      } catch (error) {
        console.error("Failed to assign user:", error);
        toast.error(t("bookUserAssign.toastAssignFailed"));
      }
    },
    [bookId],
  );

  // --- Cancel (new-book mode) --------------------------------------------

  const handleCancel = useCallback(() => {
    if (coverPreviewUrlRef.current) {
      URL.revokeObjectURL(coverPreviewUrlRef.current);
    }
    allowNextNavigation();
    router.push("/book");
  }, [router, allowNextNavigation]);

  // --- Return value -------------------------------------------------------

  return {
    bookData,
    setBookData,
    dirty,
    isSaving,
    antolinResults,

    handleSave,
    handleDelete,
    handleReturnBook,
    handleAssignUser,
    handleCancel,

    coverPreviewUrl: coverData?.previewUrl,
    autofillAttempted,
    isAutoFilling,
    handleAutoFill,
  };
}
