/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { Dispatch, useCallback, useState } from "react";

import { ArrowLeft, ImagePlus, Loader2, Save, Search } from "lucide-react";

import { AntolinResultType } from "@/entities/AntolinResultsType";
import { BookType } from "@/entities/BookType";
import { t } from "@/lib/i18n";
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
      toast.info(t("bookEditForm.toastEnterIsbn"));
      return;
    }

    if (isNewBook && onAutoFill) {
      await onAutoFill(book.isbn);
      return;
    }

    const cleanedIsbn = book.isbn.replace(/[^0-9X]/gi, "");
    if (!cleanedIsbn) {
      toast.info(t("bookEditForm.toastIsbnInvalid"));
      return;
    }

    setInternalIsAutoFilling(true);

    try {
      const apiUrl = `/api/book/FillBookByIsbn?isbn=${cleanedIsbn}&bookId=${book.id}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        toast.info(t("bookEditForm.toastIsbnNotFound"));
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
        toast.success(t("bookEditForm.toastDataAndCoverLoaded"));
      } else {
        toast.success(t("bookEditForm.toastDataLoaded"));
      }
    } catch (e: any) {
      toast.error(e?.message || t("bookEditForm.toastDataLoadError"));
    } finally {
      setInternalIsAutoFilling(false);
    }
  }, [book, setBookData, isNewBook, onAutoFill]);

  const handleFetchCover = useCallback(async () => {
    if (!book.isbn) {
      toast.info(t("bookEditForm.toastNoIsbn"));
      return;
    }
    if (!book.id) {
      toast.info(t("bookEditForm.toastSaveFirst"));
      return;
    }

    const cleanedIsbn = book.isbn.replace(/[^0-9X]/gi, "");
    if (!cleanedIsbn) {
      toast.info(t("bookEditForm.toastIsbnInvalidShort"));
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
          t("bookEditForm.toastCoverLoaded", {
            source: data.source || t("bookEditForm.toastCoverSourceUnknown"),
          }),
        );
      } else {
        toast.info(data.error || t("bookEditForm.toastCoverNotFound"));
      }
    } catch (e: any) {
      toast.error(e?.message || t("bookEditForm.toastCoverLoadError"));
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
          alt={t("bookEditForm.coverPreviewAlt")}
          data-cy="book-cover-preview"
          className="border border-border rounded-lg object-contain"
          style={{ maxHeight: 280 }}
        />
      );
    }

    if (isNewBook) {
      let message = t("bookEditForm.coverPlaceholderInitial");
      let textColor = "text-muted-foreground";

      if (isAutoFilling) {
        message = t("bookEditForm.coverSearching");
      } else if (autofillAttempted && !coverPreviewUrl) {
        message = t("bookEditForm.coverNotFound");
        textColor = "text-warning";
      }

      return (
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
        alt={t("bookEditForm.coverImageAlt")}
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
      return (
        <span className="text-xs text-muted-foreground">
          {t("bookEditForm.antolinPlaceholder")}
        </span>
      );
    }

    let resultString = t("bookEditForm.antolinPlaceholder");
    if (antolinResults.foundNumber > 1) {
      resultString = t("bookEditForm.antolinManyFound", {
        count: antolinResults.foundNumber,
      });
    } else if (antolinResults.foundNumber === 0) {
      resultString = t("bookEditForm.antolinNoneFound");
    } else if (antolinResults.foundNumber === 1) {
      resultString = t("bookEditForm.antolinOneFound");
    }

    return (
      <span className="text-xs text-muted-foreground">
        {t("bookEditForm.antolinLabel")}
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
            title={
              isNewBook
                ? t("bookEditForm.saveTitleNew")
                : t("bookEditForm.saveTitleExisting")
            }
            dataCy="save-book-button"
          >
            {isSaving
              ? t("bookEditForm.saving")
              : t("bookEditForm.save")}
          </ActionButton>
        )}

        {isNewBook && cancelAction && (
          <ActionButton
            onClick={cancelAction}
            icon={ArrowLeft}
            variant="secondary"
            title={t("bookEditForm.cancelTitle")}
            dataCy="cancel-book-button"
          >
            {t("bookEditForm.cancel")}
          </ActionButton>
        )}

        {!isNewBook && editable && (
          <HoldButton
            duration={deleteSafetySeconds * 1000}
            buttonLabel={t("bookEditForm.delete")}
            onClick={deleteBook}
            data-cy="delete-book-button"
          />
        )}
      </div>

      {/* ── ISBN & Lookup ──────────────────────────────────────────────── */}
      <SectionDivider>{t("bookEditForm.sectionIsbn")}</SectionDivider>

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
          title={t("bookEditForm.autofillTitle")}
          dataCy="autofill-button"
        >
          {isAutoFilling
            ? t("bookEditForm.autofillSearching")
            : t("bookEditForm.autofill")}
        </ActionButton>

        {!isNewBook && (
          <ActionButton
            onClick={handleFetchCover}
            disabled={!book.isbn || !book.id || fetchingCover}
            loading={fetchingCover}
            icon={ImagePlus}
            variant="outline"
            title={t("bookEditForm.fetchCoverTitle")}
            dataCy="fetch-cover-button"
          >
            {fetchingCover
              ? t("bookEditForm.fetchCoverLoading")
              : t("bookEditForm.fetchCover")}
          </ActionButton>
        )}
      </div>

      {/* ── Book Details ───────────────────────────────────────────────── */}
      <SectionDivider>{t("bookEditForm.sectionBookData")}</SectionDivider>

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

          <SectionDivider>{t("bookEditForm.sectionPublisher")}</SectionDivider>

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

          <SectionDivider>
            {t("bookEditForm.sectionRentalStatus")}
          </SectionDivider>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <BookSelect
                fieldType="rentalStatus"
                editable={editable}
                setBookData={setBookData}
                book={book}
                label={t("bookEditForm.statusLabel")}
                options={rentalStatusOptions}
              />
            </div>
            <div>
              <BookSelect
                fieldType="renewalCount"
                editable={editable}
                setBookData={setBookData}
                book={book}
                label={t("bookEditForm.renewalsLabel")}
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

          <SectionDivider>{t("bookEditForm.sectionMore")}</SectionDivider>

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
            <span className="text-xs text-success text-center">
              {t("bookEditForm.coverWillUpload")}
            </span>
          )}

          {isNewBook && autofillAttempted && !coverPreviewUrl && (
            <span className="text-xs text-muted-foreground text-center">
              {t("bookEditForm.coverUploadAfterSave")}
            </span>
          )}

          {!isNewBook && <BookBarcode book={book} />}
        </div>
      </div>

      <div className="h-px bg-border mt-8" />
    </div>
  );
}
