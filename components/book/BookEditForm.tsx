/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { Dispatch, useCallback, useState } from "react";

import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Printer,
  Save,
  Search,
} from "lucide-react";

// ✅ palette import removed entirely

import { AntolinResultType } from "@/entities/AntolinResultsType";
import { BookType } from "@/entities/BookType";
import React from "react";
import { toast } from "sonner";
import HoldButton from "../layout/HoldButton";
import BookAntolinDialog from "./edit/BookAntolinDialog";
import BookBarcode from "./edit/BookBarcode";
import BookDateField from "./edit/BookDateField";
import BookField from "./edit/BookField";
import BookImageUploadButton from "./edit/BookImageUploadButton";
import BookSelect, {
  renewalCountOptions,
  rentalStatusOptions,
} from "./edit/BookSelect";
import BookTopicsChips from "./edit/BookTopicsChips";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type BookEditFormPropType = {
  book: BookType;
  setBookData: Dispatch<BookType>;
  deleteBook: () => void;
  deleteSafetySeconds: number;
  saveBook: React.MouseEventHandler<HTMLButtonElement>;
  topics: string[];
  antolinResults: AntolinResultType | null;
  isNewBook?: boolean;
  cancelAction?: () => void;
  isSaving?: boolean;
  coverPreviewUrl?: string;
  autofillAttempted?: boolean;
  onAutoFill?: (isbn: string) => Promise<void>;
  isAutoFilling?: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI Primitives
// ─────────────────────────────────────────────────────────────────────────────

function SectionDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex items-center gap-4 py-4">
      <div className="flex-1 h-px bg-border" />
      {/* ✅ was: style={{ color: palette.info.main }} */}
      <span className="text-sm font-medium text-info whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function ActionButton({
  onClick,
  disabled = false,
  loading = false,
  icon: Icon,
  children,
  variant = "primary",
  title,
  dataCy,
}: {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  loading?: boolean;
  icon: React.ElementType;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  title?: string;
  dataCy?: string;
}) {
  const baseClasses =
    "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed";

  // ✅ was: primary used style={{ backgroundColor: palette.primary.main }}
  // ✅ was: secondary used text-gray-600 bg-gray-100 hover:bg-gray-200
  // ✅ was: outline used border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400
  const variantClasses = {
    primary:
      "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]",
    secondary:
      "text-muted-foreground bg-muted hover:bg-muted/80 active:scale-[0.98]",
    outline:
      "border border-border text-foreground bg-card hover:bg-muted/50 hover:border-ring/50 active:scale-[0.98]",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      data-cy={dataCy}
      // ✅ style prop removed entirely — no more inline palette references
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function BookEditForm({
  book,
  setBookData,
  deleteBook,
  deleteSafetySeconds = 3,
  saveBook,
  topics,
  antolinResults,
  isNewBook = false,
  cancelAction,
  isSaving = false,
  coverPreviewUrl,
  autofillAttempted = false,
  onAutoFill,
  isAutoFilling: externalIsAutoFilling,
}: BookEditFormPropType) {
  const [editable] = useState(true);
  const [loadingImage, setLoadingImage] = useState(1);
  const [antolinDetailsDialog, setAntolinDetailsDialog] = useState(false);
  const [fetchingCover, setFetchingCover] = useState(false);
  const [internalIsAutoFilling, setInternalIsAutoFilling] = useState(false);
  const router = useRouter();

  const isAutoFilling = externalIsAutoFilling ?? internalIsAutoFilling;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAutoFillFromISBN = useCallback(async () => {
    if (!book.isbn) {
      toast.info("Bitte geben Sie eine ISBN ein.");
      return;
    }

    if (isNewBook && onAutoFill) {
      await onAutoFill(book.isbn);
      return;
    }

    const cleanedIsbn = book.isbn.replace(/[^0-9X]/gi, "");
    if (!cleanedIsbn) {
      toast.info("Die ISBN ist ungültig (keine Zahlen gefunden).");
      return;
    }

    setInternalIsAutoFilling(true);

    try {
      const apiUrl = `/api/book/FillBookByIsbn?isbn=${cleanedIsbn}&bookId=${book.id}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        toast.info("Stammdaten wurden leider nicht gefunden mit dieser ISBN.");
        return;
      }

      const data = await response.json();

      setBookData({
        ...book,
        ...data,
        isbn: cleanedIsbn,
      });

      if (data.coverFetched) {
        setLoadingImage(Math.floor(Math.random() * 10000));
        toast.success("Stammdaten und Cover wurden erfolgreich geladen.");
      } else {
        toast.success("Stammdaten wurden erfolgreich ausgefüllt.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Fehler beim Laden der Buchdaten.");
    } finally {
      setInternalIsAutoFilling(false);
    }
  }, [book, setBookData, isNewBook, onAutoFill]);

  const handleFetchCover = useCallback(async () => {
    if (!book.isbn) {
      toast.info("Keine ISBN im Buch hinterlegt.");
      return;
    }
    if (!book.id) {
      toast.info("Buch muss zuerst gespeichert werden.");
      return;
    }

    const cleanedIsbn = book.isbn.replace(/[^0-9X]/gi, "");
    if (!cleanedIsbn) {
      toast.info("Die ISBN ist ungültig.");
      return;
    }

    setFetchingCover(true);
    try {
      const response = await fetch(
        `/api/book/fetchCover?isbn=${cleanedIsbn}&bookId=${book.id}`,
      );
      const data = await response.json();

      if (response.ok && data.success) {
        setLoadingImage(Math.floor(Math.random() * 10000));
        toast.success(
          `Cover wurde erfolgreich von ${data.source || "unbekannt"} geladen.`,
        );
      } else {
        toast.info(data.error || "Cover konnte nicht gefunden werden.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Fehler beim Laden des Covers.");
    } finally {
      setFetchingCover(false);
    }
  }, [book.isbn, book.id]);

  const handleAntolinClick = () => setAntolinDetailsDialog(true);

  // ── Sub-components ────────────────────────────────────────────────────────

  const CoverImage = () => {
    if (isNewBook && coverPreviewUrl) {
      return (
        <img
          src={coverPreviewUrl}
          width="200"
          height="auto"
          alt="Cover Vorschau"
          data-cy="book-cover-preview"
          className="border border-border rounded-lg object-contain"
          style={{ maxHeight: 280 }}
        />
      );
    }

    if (isNewBook) {
      let message = "ISBN eingeben und 'Ausfüllen' klicken";
      // ✅ was: textColor = "text-amber-600" for not-found state
      let textColor = "text-muted-foreground";

      if (isAutoFilling) {
        message = "Cover wird gesucht...";
      } else if (autofillAttempted && !coverPreviewUrl) {
        message = "Kein Cover gefunden";
        textColor = "text-warning";
      }

      return (
        // ✅ was: border-gray-300 bg-gray-50
        <div className="w-[200px] h-[200px] border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted text-center p-4">
          <span className={`text-sm ${textColor}`}>{message}</span>
        </div>
      );
    }

    return (
      <img
        src={`/api/images/${book.id}?${loadingImage}`}
        width="200"
        height="200"
        alt="cover image"
        key={loadingImage}
        data-cy="book-cover-image"
        className="border border-border rounded-lg"
        style={{ width: "auto" }}
      />
    );
  };

  const AntolinResult = () => {
    if (isNewBook && !book.id) return null;

    if (!antolinResults) {
      // ✅ was: text-gray-400
      return <span className="text-xs text-muted-foreground">...</span>;
    }

    let resultString = "...";
    if (antolinResults.foundNumber > 1) {
      resultString = ` ${antolinResults.foundNumber} ähnliche Bücher`;
    } else if (antolinResults.foundNumber === 0) {
      resultString = " Kein Buch gefunden";
    } else if (antolinResults.foundNumber === 1) {
      resultString = " Ein Buch gefunden";
    }

    return (
      // ✅ was: text-gray-500
      <span className="text-xs text-muted-foreground">
        Antolin:
        {/* ✅ was: text-blue-600 hover:text-blue-800 */}
        <button
          onClick={handleAntolinClick}
          className="ml-1 text-info hover:text-info/80 underline underline-offset-2 cursor-pointer"
          tabIndex={0}
        >
          {resultString}
        </button>
      </span>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    // ✅ was: border-gray-100
    <div
      className="mt-8 bg-card rounded-2xl shadow-sm border border-border px-4 sm:px-6 lg:px-8 py-6"
      data-cy="book-edit-form"
    >
      <BookAntolinDialog
        open={antolinDetailsDialog}
        setOpen={setAntolinDetailsDialog}
        antolinBooks={antolinResults}
      />

      {/* ── Action Buttons ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start pb-2">
        {editable && (
          <ActionButton
            onClick={saveBook}
            loading={isSaving}
            icon={Save}
            title={isNewBook ? "Buch erstellen und speichern" : "Speichern"}
            dataCy="save-book-button"
          >
            {isSaving ? "Speichert..." : "Speichern"}
          </ActionButton>
        )}

        {isNewBook && cancelAction && (
          <ActionButton
            onClick={cancelAction}
            icon={ArrowLeft}
            variant="secondary"
            title="Abbrechen und zurück zur Übersicht"
            dataCy="cancel-book-button"
          >
            Abbrechen
          </ActionButton>
        )}

        {editable && !isNewBook && (
          <ActionButton
            onClick={() => router.push(`/reports/print?id=${book.id}`)}
            icon={Printer}
            variant="outline"
            title="Buchlabel drucken"
            dataCy="print-book-button"
          >
            Drucken
          </ActionButton>
        )}
        {!isNewBook && editable && (
          <HoldButton
            duration={deleteSafetySeconds * 1000}
            buttonLabel="Löschen"
            onClick={deleteBook}
            data-cy="delete-book-button"
          />
        )}
      </div>

      {/* ── ISBN & Lookup ──────────────────────────────────────────────── */}
      <SectionDivider>ISBN &amp; Stammdaten</SectionDivider>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-end mb-6">
        <div className="min-w-0">
          <BookField
            fieldType="isbn"
            editable={editable}
            setBookData={setBookData}
            book={book}
            autoFocus={isNewBook}
          />
        </div>

        <ActionButton
          onClick={handleAutoFillFromISBN}
          disabled={!book.isbn || isAutoFilling}
          loading={isAutoFilling}
          icon={Search}
          variant="outline"
          title="Stammdaten und Cover mit ISBN suchen (DNB, Google Books, OpenLibrary)"
          dataCy="autofill-button"
        >
          {isAutoFilling ? "Sucht..." : "Ausfüllen"}
        </ActionButton>

        {!isNewBook && (
          <ActionButton
            onClick={handleFetchCover}
            disabled={!book.isbn || !book.id || fetchingCover}
            loading={fetchingCover}
            icon={ImagePlus}
            variant="outline"
            title="Cover von ISBN laden (OpenLibrary)"
            dataCy="fetch-cover-button"
          >
            {fetchingCover ? "Lädt..." : "Cover"}
          </ActionButton>
        )}
      </div>

      {/* ── Book Details ───────────────────────────────────────────────── */}
      <SectionDivider>Stammdaten des Buchs</SectionDivider>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Left: Form fields ──────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <BookField
                fieldType="title"
                editable={editable}
                setBookData={setBookData}
                book={book}
              />
            </div>
            <div>
              <BookField
                fieldType="author"
                editable={editable}
                setBookData={setBookData}
                book={book}
              />
            </div>
            <div>
              <BookField
                fieldType="subtitle"
                editable={editable}
                setBookData={setBookData}
                book={book}
              />
            </div>
            <div>
              <BookTopicsChips
                fieldType="topics"
                editable={editable}
                setBookData={setBookData}
                book={book}
                topics={topics}
              />
              <AntolinResult />
            </div>
            <div className="sm:col-span-2">
              <BookField
                fieldType="summary"
                editable={editable}
                setBookData={setBookData}
                book={book}
                variant="textarea"
              />
            </div>
          </div>

          <SectionDivider>Verlag &amp; Ausgabe</SectionDivider>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
            <div>
              <BookField
                fieldType="publisherName"
                editable={editable}
                setBookData={setBookData}
                book={book}
              />
            </div>
            <div>
              <BookField
                fieldType="publisherLocation"
                editable={editable}
                setBookData={setBookData}
                book={book}
              />
            </div>
            <div>
              <BookField
                fieldType="publisherDate"
                editable={editable}
                setBookData={setBookData}
                book={book}
              />
            </div>
            <div>
              <BookField
                fieldType="editionDescription"
                editable={editable}
                setBookData={setBookData}
                book={book}
              />
            </div>
            <div>
              <BookField
                fieldType="pages"
                editable={editable}
                setBookData={setBookData}
                book={book}
                variant="number"
              />
            </div>
            <div>
              <BookField
                fieldType="price"
                editable={editable}
                setBookData={setBookData}
                book={book}
              />
            </div>
          </div>

          <SectionDivider>Ausleih-Status</SectionDivider>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <BookSelect
                fieldType="rentalStatus"
                editable={editable}
                setBookData={setBookData}
                book={book}
                label="Status"
                options={rentalStatusOptions}
              />
            </div>
            <div>
              <BookSelect
                fieldType="renewalCount"
                editable={editable}
                setBookData={setBookData}
                book={book}
                label="Verlängerungen"
                options={renewalCountOptions}
              />
            </div>
            <div>
              <BookDateField
                fieldType="rentedDate"
                editable={editable}
                setBookData={setBookData}
                book={book}
              />
            </div>
            <div>
              <BookDateField
                fieldType="dueDate"
                editable={editable}
                setBookData={setBookData}
                book={book}
              />
            </div>
          </div>

          <SectionDivider>Weitere Angaben</SectionDivider>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
            <div>
              <BookField
                fieldType="minAge"
                editable={editable}
                setBookData={setBookData}
                book={book}
              />
            </div>
            <div>
              <BookField
                fieldType="maxAge"
                editable={editable}
                setBookData={setBookData}
                book={book}
              />
            </div>
            <div>
              <BookField
                fieldType="minPlayers"
                editable={editable}
                setBookData={setBookData}
                book={book}
              />
            </div>
            <div>
              <BookField
                fieldType="physicalSize"
                editable={editable}
                setBookData={setBookData}
                book={book}
              />
            </div>
            <div>
              <BookField
                fieldType="otherPhysicalAttributes"
                editable={editable}
                setBookData={setBookData}
                book={book}
              />
            </div>
            <div>
              <BookField
                fieldType="additionalMaterial"
                editable={editable}
                setBookData={setBookData}
                book={book}
              />
            </div>
            <div>
              <BookField
                fieldType="externalLinks"
                editable={editable}
                setBookData={setBookData}
                book={book}
              />
            </div>
            <div>
              <BookField
                fieldType="supplierComment"
                editable={editable}
                setBookData={setBookData}
                book={book}
              />
            </div>
          </div>
        </div>

        {/* ── Right: Cover image & barcode ───────────────────────────── */}
        <div className="flex flex-col items-center gap-4 lg:w-[220px] shrink-0">
          <CoverImage />

          {!isNewBook && (
            <BookImageUploadButton
              book={book}
              setLoadingImage={setLoadingImage}
            />
          )}

          {isNewBook && coverPreviewUrl && (
            // ✅ was: text-green-600
            <span className="text-xs text-success text-center">
              ✓ Cover wird beim Speichern hochgeladen
            </span>
          )}

          {isNewBook && autofillAttempted && !coverPreviewUrl && (
            // ✅ was: text-gray-400
            <span className="text-xs text-muted-foreground text-center">
              Cover kann nach Speichern manuell hochgeladen werden
            </span>
          )}

          {!isNewBook && <BookBarcode book={book} />}
        </div>
      </div>

      {/* ✅ was: bg-gray-200 */}
      <div className="h-px bg-border mt-8" />
    </div>
  );
}
