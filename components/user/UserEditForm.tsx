import * as React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";

import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import ListItemText from "@mui/material/ListItemText";
import { UserType } from "@/entities/UserType";

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
import { deleteUser } from "@/entities/user";
import { BookType } from "@/entities/BookType";

const bull = (
  <Box
    component="span"
    sx={{ display: "inline-block", mx: "2px", transform: "scale(0.8)" }}
  >
    •
  </Box>
);

interface UserEditFormPropType {
  user: UserType;
  books: Array<BookType>;
  setUserData: any;
  deleteUser: any;
  saveUser: any;
}

export default function UserEditForm({
  user,
  books,
  setUserData,
  deleteUser,
  saveUser,
}: UserEditFormPropType) {
  const [editable, setEditable] = useState(false);

  const [editButtonLabel, setEditButtonLabel] = useState("Editieren");

  const toggleEditButton = () => {
    editable
      ? setEditButtonLabel("Editieren")
      : setEditButtonLabel("Abbrechen");
    setEditable(!editable);
  };

  return (
    <Paper sx={{ mt: 5, px: 4 }}>
      <Divider sx={{ mb: 3 }}>
        <Typography variant="body" color={palette.info.main}>
          Daten
        </Typography>
      </Divider>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
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
        <Grid item xs={12} sm={6}>
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

        <Grid item xs={12} sm={6}>
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
        <Grid item xs={12} sm={6}>
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
        <Grid item xs={12} sm={6}>
          <TextField
            id="createdAt"
            name="createdAt"
            label="Erzeugt am"
            defaultValue={
              "Erzeugt am " + user.createdAt + " mit Nummer " + user.id
            }
            disabled={true}
            fullWidth
            variant="standard"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
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

        <Grid item xs={12} md={6}>
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
        <Typography variant="body" color={palette.info.main}>
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
        <Grid item xs={12}>
          {" "}
          {books.map((b: BookType) => {
            return (
              <ListItem key={b.id}>
                <IconButton
                  onClick={() => console.log("Returning book  ", b)}
                  aria-label="zurückgeben"
                >
                  {" "}
                  <ArrowCircleLeftIcon />
                </IconButton>
                <ListItemText>
                  {b.title + ", " + b.renewalCount + "x verlängert"}
                </ListItemText>
              </ListItem>
            );
          })}
        </Grid>
        <Grid item xs={12} md={4}>
          <Button onClick={toggleEditButton} startIcon={<EditIcon />}>
            {editButtonLabel}
          </Button>
        </Grid>
        <Grid item xs={12} md={4}>
          {editable && (
            <Button onClick={saveUser} startIcon={<SaveAltIcon />}>
              Speichern
            </Button>
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {editable && (
            <Button
              color="error"
              onClick={deleteUser}
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
