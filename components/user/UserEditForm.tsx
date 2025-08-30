import Box from "@mui/material/Box";
import * as React from "react";
import { Dispatch, useState } from "react";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";

import { UserType } from "@/entities/UserType";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import ListItemText from "@mui/material/ListItemText";

import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import EditIcon from "@mui/icons-material/Edit";

import { BookType } from "@/entities/BookType";
import palette from "@/styles/palette";
import dayjs from "dayjs";
import "dayjs/locale/de";
import HoldButton from "../layout/HoldButton";

import {
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  TextField,
  Tooltip,
} from "@mui/material";

const bull = (
  <Box
    component="span"
    sx={{ display: "inline-block", mx: "2px", transform: "scale(0.8)" }}
  >
    •
  </Box>
);

type UserEditFormPropType = {
  user: UserType;
  books: Array<BookType>;
  setUserData: Dispatch<UserType>;
  deleteUser: () => void;
  deleteSafetySeconds: number;
  saveUser: () => void;
  returnBook: (bookid: number) => void;
  extendBook: (bookid: number, book: BookType) => void;
  initiallyEditable?: boolean;
};

interface ReturnBooksType {
  bookid: number;
  time: Date;
}

type ReturnedIconPropsType = {
  id: number;
};
export default function UserEditForm({
  user,
  books,
  setUserData,
  deleteUser,
  deleteSafetySeconds = 3,
  saveUser,
  returnBook,
  extendBook,
  initiallyEditable = false,
}: UserEditFormPropType) {
  const [editable, setEditable] = useState(
    initiallyEditable ? initiallyEditable : false
  );
  // const [userBooks, setUserBooks] = useState(books);

  const [editButtonLabel, setEditButtonLabel] = useState(
    initiallyEditable ? "Abbrechen" : "Editieren"
  );
  const [returnedBooks, setReturnedBooks] = useState({});

  const toggleEditButton = () => {
    editable
      ? setEditButtonLabel("Editieren")
      : setEditButtonLabel("Abbrechen");
    setEditable(!editable);
  };

  const ReturnedIcon = ({ id }: ReturnedIconPropsType) => {
    //console.log("Rendering icon ", id, returnedBooks);
    if (id in returnedBooks) {
      return <CheckCircleIcon color="success" />;
    } else {
      return <ArrowCircleLeftIcon />;
    }
  };

  return (
    <Paper sx={{ mt: 5, px: 4 }}>
      <Divider sx={{ mb: 3 }}>
        <Typography variant="body1" color={palette.info.main}>
          Daten
        </Typography>
      </Divider>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }} >
          <TextField
            required
            id="firstName"
            name="firstName"
            label="Vorname"
            defaultValue={user.firstName}
            disabled={!editable}
            fullWidth
            autoComplete="given-name"
            variant="standard"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setUserData({ ...user, firstName: event.target.value });
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} >
          <TextField
            required
            id="lastName"
            name="lastName"
            label="Nachname"
            defaultValue={user.lastName}
            disabled={!editable}
            fullWidth
            autoComplete="family-name"
            variant="standard"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setUserData({ ...user, lastName: event.target.value });
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }} >
          <TextField
            required
            id="schoolGrade"
            name="schoolGrade"
            label="Klasse"
            defaultValue={user.schoolGrade}
            disabled={!editable}
            fullWidth
            autoComplete="shipping address-level2"
            variant="standard"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setUserData({ ...user, schoolGrade: event.target.value });
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} >
          <TextField
            id="schoolTeacherName"
            name="schoolTeacherName"
            label="Lehrkraft"
            defaultValue={user.schoolTeacherName}
            disabled={!editable}
            fullWidth
            variant="standard"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setUserData({
                ...user,
                schoolTeacherName: event.target.value,
              });
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} >
          <TextField
            id="createdAt"
            name="createdAt"
            label="Erzeugt am"
            defaultValue={
              "User erstellt am " +
              user.createdAt +
              " mit Ausweisnummer " +
              user.id
            }
            disabled={true}
            fullWidth
            variant="standard"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} >
          <TextField
            id="lastUpdated"
            name="lastUpdated"
            label="Letztes Update"
            defaultValue={user.updatedAt}
            disabled={true}
            fullWidth
            variant="standard"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} >
          <FormControlLabel
            control={
              <Checkbox
                color="secondary"
                name="saveActive"
                disabled={!editable}
                checked={user.active}
                onClick={() => {
                  const toggleValue = !user.active;
                  setUserData({ ...user, active: toggleValue });
                }}
              />
            }
            label="Aktiv"
          />
        </Grid>
      </Grid>
      <Divider sx={{ mb: 3 }}>
        <Typography variant="body1" color={palette.info.main}>
          Geliehene Bücher
        </Typography>
      </Divider>
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <Grid size={{ xs: 12 }} >
          {" "}
          {books.map((b: BookType) => {
            return "id" in b ? (
              <ListItem key={b.id}>
                <Tooltip title="Zurückgeben">
                  <IconButton
                    onClick={() => {
                      returnBook(b.id!);
                      const time = Date.now();
                      const newbook = {};
                      (newbook as any)[b.id!] = time;
                      setReturnedBooks({ ...returnedBooks, ...newbook });
                    }}
                    aria-label="zurückgeben"
                  >
                    <ReturnedIcon key={b.id} id={b.id!} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Verlängern">
                  <IconButton
                    onClick={() => {
                      if (!b.id) return;
                      extendBook(b.id, b);
                    }}
                    aria-label="verlängern"
                  >
                    <MoreTimeIcon key={b.id} />
                  </IconButton>
                </Tooltip>
                <ListItemText>

                  {dayjs().diff(b.dueDate, "days") > 13 && (
                    <Typography color="red">
                      {b.title + ", " + b.renewalCount + "x verlängert bis " + dayjs(b.dueDate).format("DD.MM.YYYY")}
                    </Typography >
                  )}
                  {dayjs().diff(b.dueDate, "days") > 0 && dayjs().diff(b.dueDate, "days") <= 13 && (
                    <Typography color="darkorange">
                      {b.title + ", " + b.renewalCount + "x verlängert bis " + dayjs(b.dueDate).format("DD.MM.YYYY")}
                    </Typography >
                  )}
                  {dayjs().diff(b.dueDate, "days") <= 0 && (
                    b.title + ", " + b.renewalCount + "x verlängert bis " + dayjs(b.dueDate).format("DD.MM.YYYY")
                  )}

                </ListItemText>
              </ListItem>
            ) : (
              <div>ID not found</div>
            );
          })}
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} >
          <Button onClick={toggleEditButton} startIcon={<EditIcon />}>
            {editButtonLabel}
          </Button>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          {editable && (
            <Button
              onClick={() => {
                saveUser();
                toggleEditButton();
              }}
              startIcon={<SaveAltIcon />}
            >
              Speichern
            </Button>
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          {editable && (
            <HoldButton
              duration={deleteSafetySeconds * 1000}
              onClick={deleteUser}
              buttonLabel="Löschen"
            />
          )}
        </Grid>{" "}
      </Grid>
    </Paper>
  );
}
