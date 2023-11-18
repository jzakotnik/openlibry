import Box from "@mui/material/Box";
import { useState } from "react";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import SaveAltIcon from "@mui/icons-material/SaveAlt";

import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";

import palette from "@/styles/palette";
import { Divider, Grid, Paper, Tooltip } from "@mui/material";

import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import BookBarcode from "./edit/BookBarcode";
import BookDateField from "./edit/BookDateField";
import BookImageUploadButton from "./edit/BookImageUploadButton";
import BookMultiText from "./edit/BookMultiText";
import BookNumberField from "./edit/BookNumberField";
import BookStatusDropdown from "./edit/BookStatusDropdown";
import BookTextField from "./edit/BookTextField";
import BookTopicsChips from "./edit/BookTopicsChips";

const bull = (
  <Box
    component="span"
    sx={{ display: "inline-block", mx: "2px", transform: "scale(0.8)" }}
  >
    •
  </Box>
);

interface BookEditFormPropType {
  user: UserType;
  book: BookType;
  setBookData: any;
  deleteBook: any;
  saveBook: any;
  returnBook: any;
  topics: string[];
  antolinResults: any;
}

interface ReturnBooksType {
  bookid: number;
  time: Date;
}

export default function BookEditForm({
  user,
  book,
  setBookData,
  deleteBook,
  saveBook,
  returnBook,
  topics,
  antolinResults,
}: BookEditFormPropType) {
  const [editable, setEditable] = useState(false);
  const [loadingImage, setLoadingImage] = useState(1); //key for changing image

  const [editButtonLabel, setEditButtonLabel] = useState("Editieren");
  const [returnedBooks, setReturnedBooks] = useState({});

  const toggleEditButton = () => {
    editable
      ? setEditButtonLabel("Editieren")
      : setEditButtonLabel("Abbrechen");
    setEditable(!editable);
  };

  const ReturnedIcon = ({ id }: any) => {
    //console.log("Rendering icon ", id, returnedBooks);
    if (id in returnedBooks) {
      return <CheckCircleIcon color="success" />;
    } else {
      return <ArrowCircleLeftIcon />;
    }
  };

  const CoverImage = (props: any) => {
    //console.log("Key", loadingImage); //this forces a reload after upload
    return (
      <img
        src={
          process.env.NEXT_PUBLIC_API_URL +
          "/api/images/" +
          book.id +
          "?" +
          loadingImage
        }
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
  console.log(
    "This is the antolin results for this book on the edit form",
    antolinResults
  );

  return (
    <Paper sx={{ mt: 5, px: 4 }}>
      {" "}
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <Grid item xs={12} md={4}>
          <Tooltip title={editButtonLabel}>
            <Button onClick={toggleEditButton} startIcon={<EditIcon />}>
              {editButtonLabel}
            </Button>
          </Tooltip>
        </Grid>
        <Grid item xs={12} md={4}>
          {editable && (
            <Tooltip title="Speichern">
              <Button
                onClick={() => {
                  saveBook();
                  toggleEditButton();
                }}
                startIcon={<SaveAltIcon />}
              >
                Speichern
              </Button>
            </Tooltip>
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {editable && (
            <Tooltip title="Löschen">
              <Button
                color="error"
                onClick={deleteBook}
                startIcon={<DeleteForeverIcon />}
              >
                Löschen
              </Button>
            </Tooltip>
          )}
        </Grid>{" "}
      </Grid>
      <Divider sx={{ mb: 3 }}>
        <Typography variant="body1" color={palette.info.main}>
          Stammdaten des Buchs
        </Typography>
      </Divider>
      <Grid container direction="row" justifyContent="center" alignItems="top">
        {" "}
        <Grid item container xs={12} sm={9} direction="row" spacing={2}>
          {" "}
          <Grid item xs={12} sm={6}>
            <BookTextField
              fieldType={"title"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BookTextField
              fieldType={"author"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BookTextField
              fieldType={"subtitle"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BookTopicsChips
              fieldType={"topics"}
              editable={editable}
              setBookData={setBookData}
              book={book}
              topics={topics}
            />
            <Typography variant="caption">
              Antolin-Suche:{" "}
              {antolinResults
                ? antolinResults.foundNumber > 1
                  ? antolinResults.foundNumber + " Bücher"
                  : "1 Buch"
                : "..."}{" "}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <BookMultiText
              fieldType={"summary"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BookTextField
              fieldType={"isbn"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />{" "}
          </Grid>
          <Grid item xs={12} sm={6}>
            <BookTextField
              fieldType={"editionDescription"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />{" "}
          </Grid>
          <Grid item xs={12} sm={6}>
            <BookTextField
              fieldType={"publisherName"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />{" "}
          </Grid>
          <Grid item xs={12} sm={6}>
            <BookTextField
              fieldType={"publisherLocation"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />{" "}
          </Grid>
          <Grid item xs={12} sm={6}>
            <BookTextField
              fieldType={"publisherDate"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />{" "}
          </Grid>
          <Grid item xs={12} sm={6}>
            <BookTextField
              fieldType={"pages"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />{" "}
          </Grid>{" "}
          <Divider sx={{ mb: 3 }}></Divider>
          <Grid item xs={12} sm={6}>
            <BookStatusDropdown
              fieldType={"rentalStatus"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />{" "}
          </Grid>
          <Grid item xs={12} sm={6}>
            <BookNumberField
              fieldType={"renewalCount"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />{" "}
          </Grid>
          <Grid item xs={12} sm={6}>
            <BookDateField
              fieldType={"rentedDate"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />{" "}
          </Grid>
          <Grid item xs={12} sm={6}>
            <BookDateField
              fieldType={"dueDate"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />{" "}
          </Grid>{" "}
          <Divider sx={{ mb: 3 }}></Divider>
          <Grid item xs={12} sm={6}>
            <BookTextField
              fieldType={"minAge"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />{" "}
          </Grid>
          <Grid item xs={12} sm={6}>
            <BookTextField
              fieldType={"maxAge"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />{" "}
          </Grid>
          <Grid item xs={12} sm={6}>
            <BookTextField
              fieldType={"price"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />{" "}
          </Grid>
          <Grid item xs={12} sm={6}>
            <BookTextField
              fieldType={"externalLinks"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />{" "}
          </Grid>
          <Grid item xs={12} sm={6}>
            <BookTextField
              fieldType={"additionalMaterial"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />{" "}
          </Grid>
          <Grid item xs={12} sm={6}>
            <BookTextField
              fieldType={"minPlayers"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />{" "}
          </Grid>
          <Grid item xs={12} sm={6}>
            <BookTextField
              fieldType={"otherPhysicalAttributes"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />{" "}
          </Grid>
          <Grid item xs={12} sm={6}>
            <BookTextField
              fieldType={"supplierComment"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />{" "}
          </Grid>
          <Grid item xs={12} sm={6}>
            <BookTextField
              fieldType={"physicalSize"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />{" "}
          </Grid>
          <Grid item xs={12} sm={6}>
            <BookTextField
              fieldType={"additionalMaterial"}
              editable={editable}
              setBookData={setBookData}
              book={book}
            />
          </Grid>
        </Grid>
        <Grid
          item
          container
          xs={12}
          sm={3}
          direction="column"
          justifyContent="top"
          alignItems="center"
        >
          <Grid item>
            <CoverImage />
            <BookImageUploadButton
              book={book}
              setLoadingImage={setLoadingImage}
            />
          </Grid>{" "}
          <Grid item>
            <BookBarcode book={book} />
          </Grid>
        </Grid>
      </Grid>
      <Divider sx={{ mb: 3 }}></Divider>
    </Paper>
  );
}
