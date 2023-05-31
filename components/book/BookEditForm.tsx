import * as React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import Image from "next/image";

import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ListItem from "@mui/material/ListItem";

import SaveAltIcon from "@mui/icons-material/SaveAlt";
import ListItemText from "@mui/material/ListItemText";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";

import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import palette from "@/styles/palette";
import {
  Divider,
  Paper,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import { translations } from "@/entities/fieldTranslations";

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
  hasImage: boolean;
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
  hasImage,
}: BookEditFormPropType) {
  const [editable, setEditable] = useState(false);

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

  const BookTextField = (props: any): any => {
    const fieldType = props.fieldType;
    return (
      <Grid item xs={12} sm={6}>
        <TextField
          required
          id={fieldType}
          name={fieldType}
          label={(translations["books"] as any)[fieldType]}
          defaultValue={(book as any)[fieldType]}
          disabled={!editable}
          fullWidth
          variant="standard"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setBookData({ ...book, [fieldType]: event.target.value });
          }}
        />
      </Grid>
    );
  };
  /*
id?: number;
  rentalStatus: string;
  rentedDate: Date | string;
  dueDate?: Date | string;
  renewalCount: number;
  -title: string;
  -subtitle?: string;
  -author: string;
  -topics?: string;
  imageLink?: string;
  //additional fields from OpenBiblio data model
  - isbn?: string;
  - editionDescription?: string;
  -publisherLocation?: string;
  -pages?: number;
  - summary?: string;
  -minPlayers?: string;
  --publisherName?: string;
  - otherPhysicalAttributes?: string;
  - supplierComment?: string;
  - publisherDate?: string;
  physicalSize?: string;
  minAge?: string;
  maxAge?: string;
  additionalMaterial?: string;
  price?: string;
  externalLinks?: string;
  userId?: number;
  */

  return (
    <Paper sx={{ mt: 5, px: 4 }}>
      <Divider sx={{ mb: 3 }}>
        <Typography variant="body1" color={palette.info.main}>
          Stammdaten des Buchs
        </Typography>
      </Divider>

      <Grid
        container
        direction="row"
        justifyContent="top"
        alignItems="top"
        spacing={2}
      >
        {" "}
        <Grid item xs={12} sm={3}>
          {hasImage && (
            <Image
              src={"/coverimages/" + book.id + ".jpg"}
              width="200"
              height="200"
              alt="cover image"
              style={{
                border: "1px solid #fff",
                width: "auto",
              }}
            />
          )}
        </Grid>{" "}
        <Grid item container xs={12} sm={9} spacing={3}>
          {" "}
          <BookTextField fieldType={"title"} />
          <BookTextField fieldType={"author"} />
          <BookTextField fieldType={"subtitle"} />
          <BookTextField fieldType={"topics"} />
          <BookTextField fieldType={"summary"} />
          <BookTextField fieldType={"isbn"} />
          <BookTextField fieldType={"editionDescription"} />
          <BookTextField fieldType={"publisherName"} />
          <BookTextField fieldType={"publisherLocation"} />
          <BookTextField fieldType={"publisherDate"} />
          <BookTextField fieldType={"pages"} />
          <BookTextField fieldType={"minAge"} />
          <BookTextField fieldType={"maxAge"} />
          <BookTextField fieldType={"rentalStatus"} />
          <BookTextField fieldType={"renewalCount"} />
          <BookTextField fieldType={"rentedDate"} />
          <BookTextField fieldType={"dueDate"} />
          <BookTextField fieldType={"price"} />
          <BookTextField fieldType={"externalLinks"} />
          <BookTextField fieldType={"additionalMaterial"} />
          <BookTextField fieldType={"minPlayers"} />
          <BookTextField fieldType={"otherPhysicalAttributes"} />
          <BookTextField fieldType={"supplierComment"} />
          <BookTextField fieldType={"physicalSize"} />
          <BookTextField fieldType={"additionalMaterial"} />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }}>
        <Typography variant="body1" color={palette.info.main}>
          Weitere Information
        </Typography>
      </Divider>
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <Grid item xs={12} md={4}>
          <Button onClick={toggleEditButton} startIcon={<EditIcon />}>
            {editButtonLabel}
          </Button>
        </Grid>
        <Grid item xs={12} md={4}>
          {editable && (
            <Button
              onClick={() => {
                saveBook();
                toggleEditButton();
              }}
              startIcon={<SaveAltIcon />}
            >
              Speichern
            </Button>
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {editable && (
            <Button
              color="error"
              onClick={deleteBook}
              startIcon={<DeleteForeverIcon />}
            >
              Löschen
            </Button>
          )}
        </Grid>{" "}
      </Grid>
    </Paper>
  );
}
