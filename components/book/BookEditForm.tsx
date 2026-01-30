/* eslint-disable @next/next/no-img-element */
import Box from "@mui/material/Box";
import { useRouter } from "next/router";
import { Dispatch, useCallback, useState } from "react";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import PrintIcon from "@mui/icons-material/Print";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import SearchIcon from "@mui/icons-material/Search";

import palette from "@/styles/palette";
import {
  CircularProgress,
  Divider,
  Grid,
  Link,
  Paper,
  Tooltip,
} from "@mui/material";

import { AntolinResultType } from "@/entities/AntolinResultsType";
import { BookType } from "@/entities/BookType";
import React from "react";
import HoldButton from "../layout/HoldButton";
import BookAntolinDialog from "./edit/BookAntolinDialog";
import BookBarcode from "./edit/BookBarcode";
import BookDateField from "./edit/BookDateField";
import BookImageUploadButton from "./edit/BookImageUploadButton";
import BookMultiText from "./edit/BookMultiText";
import BookNumberField from "./edit/BookNumberField";
import BookPagesField from "./edit/BookPagesField";
import BookStatusDropdown from "./edit/BookStatusDropdown";
import BookTextField from "./edit/BookTextField";
import BookTopicsChips from "./edit/BookTopicsChips";

import { useSnackbar } from "notistack";

type BookEditFormPropType = {
  book: BookType;
  setBookData: Dispatch<BookType>;
  deleteBook: React.MouseEventHandler<HTMLButtonElement>;
  deleteSafetySeconds: number;
  saveBook: React.MouseEventHandler<HTMLButtonElement>;
  topics: string[];
  antolinResults: AntolinResultType | null;
  /** Indicates if this is a new book being created (not yet in database) */
  isNewBook?: boolean;
  /** Optional cancel action for new book mode */
  cancelAction?: () => void;
  /** Optional flag to show saving state */
  isSaving?: boolean;
  /** Cover preview URL for new books (blob URL from memory) */
  coverPreviewUrl?: string;
  /** Whether autofill has been attempted (to show appropriate placeholder) */
  autofillAttempted?: boolean;
  /** External autofill handler for new books (fetches data + cover) */
  onAutoFill?: (isbn: string) => Promise<void>;
  /** External autofill loading state */
  isAutoFilling?: boolean;
};

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
  // For new books, always start in edit mode
  const [editable, setEditable] = useState(true);
  const [loadingImage, setLoadingImage] = useState(1);
  const [antolinDetailsDialog, setAntolinDetailsDialog] = useState(false);
  const [fetchingCover, setFetchingCover] = useState(false);
  const [internalIsAutoFilling, setInternalIsAutoFilling] = useState(false);
  const router = useRouter();
  const [editButtonLabel, setEditButtonLabel] = useState("Editieren");

  const { enqueueSnackbar } = useSnackbar();

  // Use external loading state if provided, otherwise internal
  const isAutoFilling = externalIsAutoFilling ?? internalIsAutoFilling;

  /**
   * Handle auto-fill from ISBN
   * For new books: delegates to external handler (which also fetches cover)
   * For existing books: uses internal logic
   */
  const handleAutoFillFromISBN = useCallback(async () => {
    if (!book.isbn) {
      enqueueSnackbar("Bitte geben Sie eine ISBN ein.", { variant: "warning" });
      return;
    }

    // For new books, use external handler if provided
    if (isNewBook && onAutoFill) {
      await onAutoFill(book.isbn);
      return;
    }

    // Internal logic for existing books
    const cleanedIsbn = book.isbn.replace(/[^0-9X]/gi, "");
    if (!cleanedIsbn) {
      enqueueSnackbar("Die ISBN ist ungültig (keine Zahlen gefunden).", {
        variant: "warning",
      });
      return;
    }

    setInternalIsAutoFilling(true);

    try {
      const apiUrl = `/api/book/FillBookByIsbn?isbn=${cleanedIsbn}&bookId=${book.id}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        enqueueSnackbar(
          "Stammdaten wurden leider nicht gefunden mit dieser ISBN.",
          { variant: "error" },
        );
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
        enqueueSnackbar("Stammdaten und Cover wurden erfolgreich geladen.", {
          variant: "success",
        });
      } else {
        enqueueSnackbar("Stammdaten wurden erfolgreich ausgefüllt.", {
          variant: "success",
        });
      }
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Fehler beim Laden der Buchdaten.", {
        variant: "error",
      });
    } finally {
      setInternalIsAutoFilling(false);
    }
  }, [book, setBookData, isNewBook, onAutoFill, enqueueSnackbar]);

  /**
   * Fetch cover from ISBN (for existing books only)
   */
  const handleFetchCover = useCallback(async () => {
    if (!book.isbn) {
      enqueueSnackbar("Keine ISBN im Buch hinterlegt.", { variant: "warning" });
      return;
    }
    if (!book.id) {
      enqueueSnackbar("Buch muss zuerst gespeichert werden.", {
        variant: "warning",
      });
      return;
    }

    const cleanedIsbn = book.isbn.replace(/[^0-9X]/gi, "");
    if (!cleanedIsbn) {
      enqueueSnackbar("Die ISBN ist ungültig.", { variant: "warning" });
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
        enqueueSnackbar(
          `Cover wurde erfolgreich von ${data.source || "unbekannt"} geladen.`,
          { variant: "success" },
        );
      } else {
        enqueueSnackbar(data.error || "Cover konnte nicht gefunden werden.", {
          variant: "warning",
        });
      }
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Fehler beim Laden des Covers.", {
        variant: "error",
      });
    } finally {
      setFetchingCover(false);
    }
  }, [book.isbn, book.id, enqueueSnackbar]);

  const toggleEditButton = () => {
    editable
      ? setEditButtonLabel("Editieren")
      : setEditButtonLabel("Abbrechen");
    setEditable(!editable);
  };

  const handleAntolinClick = () => {
    setAntolinDetailsDialog(true);
  };

  /**
   * Cover image component - handles both new books (preview URL) and existing books (API)
   */
  const CoverImage = () => {
    // For new books with a cover preview from memory
    if (isNewBook && coverPreviewUrl) {
      return (
        <img
          src={coverPreviewUrl}
          width="200"
          height="auto"
          alt="Cover Vorschau"
          data-cy="book-cover-preview"
          style={{
            border: "1px solid #ddd",
            maxHeight: 280,
            objectFit: "contain",
          }}
        />
      );
    }

    // For new books - show status-based placeholder
    if (isNewBook) {
      let message = "ISBN eingeben und 'Ausfüllen' klicken";
      let color = "text.secondary";

      if (isAutoFilling) {
        message = "Cover wird gesucht...";
      } else if (autofillAttempted && !coverPreviewUrl) {
        message = "Kein Cover gefunden";
        color = "warning.main";
      }

      return (
        <Box
          sx={{
            width: 200,
            height: 200,
            border: "1px dashed #ccc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f5f5",
            textAlign: "center",
            p: 2,
          }}
        >
          <Typography variant="body2" color={color}>
            {message}
          </Typography>
        </Box>
      );
    }

    // For existing books - load from API
    return (
      <img
        src={`/api/images/${book.id}?${loadingImage}`}
        width="200"
        height="200"
        alt="cover image"
        key={loadingImage}
        data-cy="book-cover-image"
        style={{
          border: "1px solid #fff",
          width: "auto",
        }}
      />
    );
  };

  const AntolinResult = () => {
    // Don't show Antolin for new unsaved books
    if (isNewBook && !book.id) {
      return null;
    }

    let resultString = "...";
    if (antolinResults) {
      if (antolinResults.foundNumber > 1) {
        resultString = ` ${antolinResults.foundNumber} Bücher`;
      } else if (antolinResults.foundNumber === 0) {
        resultString = " Kein Buch gefunden";
      } else if (antolinResults.foundNumber === 1) {
        resultString = " Ein Buch gefunden";
      }

      return (
        <Typography variant="caption">
          Antolin-Suche:
          <Link onClick={handleAntolinClick} tabIndex={0} component="button">
            {resultString}
          </Link>
        </Typography>
      );
    }
    return <Typography variant="caption">...</Typography>;
  };

  return (
    <Paper sx={{ mt: 5, px: 4 }} data-cy="book-edit-form">
      <BookAntolinDialog
        open={antolinDetailsDialog}
        setOpen={setAntolinDetailsDialog}
        antolinBooks={antolinResults}
      />

      {/* Action Buttons Row */}
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <Grid size={{ xs: 12, md: 3 }}>
          {editable && (
            <Tooltip
              title={isNewBook ? "Buch erstellen und speichern" : "Speichern"}
            >
              <span>
                <Button
                  onClick={saveBook}
                  startIcon={
                    isSaving ? <CircularProgress size={16} /> : <SaveAltIcon />
                  }
                  disabled={isSaving}
                  data-cy="save-book-button"
                >
                  {isSaving ? "Speichert..." : "Speichern"}
                </Button>
              </span>
            </Tooltip>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          {isNewBook && cancelAction && (
            <Tooltip title="Abbrechen und zurück zur Übersicht">
              <Button
                onClick={cancelAction}
                startIcon={<ArrowBackIcon />}
                color="secondary"
                data-cy="cancel-book-button"
              >
                Abbrechen
              </Button>
            </Tooltip>
          )}
          {!isNewBook && editable && (
            <Tooltip title="Löschen">
              <HoldButton
                duration={deleteSafetySeconds * 1000}
                buttonLabel="Löschen"
                onClick={deleteBook}
                data-cy="delete-book-button"
              />
            </Tooltip>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          {editable && !isNewBook && (
            <Tooltip title="Buchlabel drucken">
              <Button
                onClick={() => {
                  router.push(`/reports/print?id=${book.id}`);
                }}
                startIcon={<PrintIcon />}
                data-cy="print-book-button"
              >
                Drucken
              </Button>
            </Tooltip>
          )}
        </Grid>
      </Grid>

      {/* ISBN Lookup Section - At the top with unified ISBN field */}
      <Divider sx={{ mb: 3, mt: 2 }}>
        <Typography variant="body1" color={palette.info.main}>
          ISBN & Stammdaten
        </Typography>
      </Divider>

      <Grid
        container
        justifyContent="center"
        alignItems="center"
        spacing={2}
        sx={{ mb: 3 }}
      >
        {/* ISBN Field - Primary entry point */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <BookTextField
            fieldType={"isbn"}
            editable={editable}
            setBookData={setBookData}
            book={book}
            autoFocus={isNewBook} // Focus ISBN first for new books
          />
        </Grid>

        {/* Autofill Button */}
        <Grid size={{ xs: 6, sm: 3, md: 2 }}>
          <Tooltip title="Stammdaten und Cover mit ISBN suchen (DNB, Google Books, OpenLibrary)">
            <span>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleAutoFillFromISBN}
                disabled={!book.isbn || isAutoFilling}
                startIcon={
                  isAutoFilling ? (
                    <CircularProgress size={16} />
                  ) : (
                    <SearchIcon />
                  )
                }
                data-cy="autofill-button"
              >
                {isAutoFilling ? "Sucht..." : "Ausfüllen"}
              </Button>
            </span>
          </Tooltip>
        </Grid>

        {/* Fetch Cover Button (only for existing books) */}
        {!isNewBook && (
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Tooltip title="Cover von ISBN laden (OpenLibrary)">
              <span>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleFetchCover}
                  disabled={!book.isbn || !book.id || fetchingCover}
                  startIcon={
                    fetchingCover ? (
                      <CircularProgress size={16} />
                    ) : (
                      <ImageSearchIcon />
                    )
                  }
                  data-cy="fetch-cover-button"
                >
                  {fetchingCover ? "Lädt..." : "Cover"}
                </Button>
              </span>
            </Tooltip>
          </Grid>
        )}
      </Grid>

      {/* Book Details Section */}
      <Divider sx={{ mb: 3 }}>
        <Typography variant="body1" color={palette.info.main}>
          Stammdaten des Buchs
        </Typography>
      </Divider>

      <Grid container direction="row" justifyContent="center" alignItems="top">
        <Grid container size={{ xs: 12, sm: 9 }} direction="row" spacing={2}>
          {/* Title - Tab order 1 */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"title"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>

          {/* Author - Tab order 2 */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"author"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>

          {/* Subtitle - Tab order 3 */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"subtitle"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>

          {/* Topics - Tab order 4 */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTopicsChips
              fieldType={"topics"}
              editable={editable}
              setBookData={setBookData}
              book={book}
              topics={topics}
            />
            <AntolinResult />
          </Grid>

          {/* Summary - Tab order 5 */}
          <Grid size={{ xs: 12 }}>
            <BookMultiText
              fieldType={"summary"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>

          {/* Edition Description */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"editionDescription"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>

          {/* Publisher Name */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"publisherName"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>

          {/* Publisher Location */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"publisherLocation"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>

          {/* Publisher Date */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"publisherDate"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>

          {/* Pages */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <BookPagesField
              fieldType={"pages"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>

          <Divider sx={{ mb: 3, width: "100%" }} />

          {/* Rental Status Section */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <BookStatusDropdown
              fieldType={"rentalStatus"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BookNumberField
              fieldType={"renewalCount"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BookDateField
              fieldType={"rentedDate"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BookDateField
              fieldType={"dueDate"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>

          <Divider sx={{ mb: 3, width: "100%" }} />

          {/* Additional Fields */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"minAge"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"maxAge"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"price"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"externalLinks"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"additionalMaterial"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"minPlayers"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"otherPhysicalAttributes"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"supplierComment"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"physicalSize"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>
        </Grid>

        {/* Cover Image and Barcode Column */}
        <Grid
          container
          size={{ xs: 12, sm: 3 }}
          direction="column"
          justifyContent="flex-start"
          alignItems="center"
        >
          <Grid>
            <CoverImage />
            {!isNewBook && (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
              >
                <BookImageUploadButton
                  book={book}
                  setLoadingImage={setLoadingImage}
                />
              </Box>
            )}
            {isNewBook && coverPreviewUrl && (
              <Typography
                variant="caption"
                color="success.main"
                sx={{ display: "block", mt: 1, textAlign: "center" }}
              >
                ✓ Cover wird beim Speichern hochgeladen
              </Typography>
            )}
            {isNewBook && autofillAttempted && !coverPreviewUrl && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1, textAlign: "center" }}
              >
                Cover kann nach Speichern manuell hochgeladen werden
              </Typography>
            )}
          </Grid>
          {!isNewBook && (
            <Grid>
              <BookBarcode book={book} />
            </Grid>
          )}
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />
    </Paper>
  );
}
