/* eslint-disable @next/next/no-img-element */
import Box from "@mui/material/Box";
import { useRouter } from "next/router";
import { Dispatch, useState } from "react";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import PrintIcon from "@mui/icons-material/Print";
import SaveAltIcon from "@mui/icons-material/SaveAlt";

import palette from "@/styles/palette";
import { Divider, Grid, Link, Paper, Tooltip } from "@mui/material";

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

const bull = (
  <Box
    component="span"
    sx={{ display: "inline-block", mx: "1px", transform: "scale(0.8)" }}
  >
    •
  </Box>
);

type BookEditFormPropType = {
  book: BookType;
  setBookData: Dispatch<BookType>;
  deleteBook: React.MouseEventHandler<HTMLButtonElement>;
  deleteSafetySeconds: number;
  saveBook: React.MouseEventHandler<HTMLButtonElement>;
  topics: string[];
  antolinResults: AntolinResultType | null;
};

export default function BookEditForm({
  book,
  setBookData,
  deleteBook,
  deleteSafetySeconds = 3,
  saveBook,
  topics,
  antolinResults,
}: BookEditFormPropType) {
  const [editable, setEditable] = useState(true);
  const [loadingImage, setLoadingImage] = useState(1); //key for changing image
  const [antolinDetailsDialog, setAntolinDetailsDialog] = useState(false);
  const router = useRouter();
  const [editButtonLabel, setEditButtonLabel] = useState("Editieren");

  const { enqueueSnackbar } = useSnackbar();

  //Begin autofill stuff
  const [isbnInput, setIsbnInput] = useState("");

  const handleAutoFillFromISBN = async () => {
    if (!isbnInput) {
      enqueueSnackbar("Bitte geben Sie eine ISBN ein.", { variant: "warning" });
      return;
    }
    // Remove all non-digit characters from the input
    const cleanedIsbn = isbnInput.replace(/\D/g, "");
    if (!cleanedIsbn) {
      enqueueSnackbar("Die ISBN ist ungültig (keine Zahlen gefunden).", {
        variant: "warning",
      });
      return;
    }
    try {
      const response = await fetch(
        `/api/book/FillBookByIsbn?isbn=${cleanedIsbn}`
      );
      if (!response.ok) {
        enqueueSnackbar(
          "Stammdaten wurden leider nicht gefunden mit dieser ISBN..",
          { variant: "error" }
        );
        return;
      }
      const data = await response.json();
      setBookData({
        ...book,
        ...data, // Merge the fields
      });
      enqueueSnackbar("Stammdaten wurden erfolgreich ausgefüllt.", {
        variant: "success",
      });
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Fehler beim Laden der Buchdaten.", {
        variant: "error",
      });
    }
  };
  //End autofill stuff

  const toggleEditButton = () => {
    editable
      ? setEditButtonLabel("Editieren")
      : setEditButtonLabel("Abbrechen");
    setEditable(!editable);
  };

  const handleAntolinClick = () => {
    setAntolinDetailsDialog(true);
  };

  const CoverImage = () => {
    return (
      <img
        src={`/api/images/${book.id}?${loadingImage}`}
        width="200"
        height="200"
        alt="cover image"
        key={loadingImage}
        style={{
          border: "1px solid #fff",
          width: "auto",
        }}
      />
    );
  };

  const AntolinResult = () => {
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
    <Paper sx={{ mt: 5, px: 4 }}>
      <BookAntolinDialog
        open={antolinDetailsDialog}
        setOpen={setAntolinDetailsDialog}
        antolinBooks={antolinResults}
      />
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <Grid size={{ xs: 12, md: 4 }}>
          {editable && (
            <Tooltip title="Speichern">
              <Button
                onClick={(e) => {
                  saveBook(e);
                }}
                startIcon={<SaveAltIcon />}
              >
                Speichern
              </Button>
            </Tooltip>
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          {editable && (
            <Tooltip title="Löschen">
              <HoldButton
                duration={deleteSafetySeconds * 1000}
                buttonLabel="Löschen"
                onClick={deleteBook}
              />
            </Tooltip>
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          {editable && (
            <Tooltip title="Buchlabel drucken">
              <Button
                onClick={(e) => {
                  router.push(`/reports/print?id=${book.id}`);
                }}
                startIcon={<PrintIcon />}
              >
                Drucken
              </Button>
            </Tooltip>
          )}
        </Grid>
      </Grid>
      <Divider sx={{ mb: 3 }}>
        <Typography variant="body1" color={palette.info.main}>
          Automatisches Ausfüllen
        </Typography>
      </Divider>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="ISBN"
            variant="outlined"
            size="small"
            value={isbnInput}
            onChange={(e) => setIsbnInput(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Tooltip title="Stammdaten mit ISBN in Datenbanken suchen">
            <Button variant="outlined" onClick={handleAutoFillFromISBN}>
              Stammdaten ausfüllen
            </Button>
          </Tooltip>
        </Grid>
      </Grid>
      <Divider sx={{ mb: 3 }}>
        <Typography variant="body1" color={palette.info.main}>
          Stammdaten des Buchs
        </Typography>
      </Divider>
      <Grid container direction="row" justifyContent="center" alignItems="top">
        <Grid container size={{ xs: 12, sm: 9 }} direction="row" spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"title"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"author"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"subtitle"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>
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
          <Grid size={{ xs: 12 }}>
            <BookMultiText
              fieldType={"summary"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"isbn"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"editionDescription"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"publisherName"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"publisherLocation"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BookTextField
              fieldType={"publisherDate"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BookPagesField
              fieldType={"pages"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>
          <Divider sx={{ mb: 3 }}></Divider>
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
          <Divider sx={{ mb: 3 }}></Divider>
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
        <Grid
          container
          size={{ xs: 12, sm: 3 }}
          direction="column"
          justifyContent="top"
          alignItems="center"
        >
          <Grid>
            <CoverImage />
            <BookImageUploadButton
              book={book}
              setLoadingImage={setLoadingImage}
            />
          </Grid>
          <Grid>
            <BookBarcode book={book} />
          </Grid>
        </Grid>
      </Grid>
      <Divider sx={{ mb: 3 }}></Divider>
    </Paper>
  );
}
