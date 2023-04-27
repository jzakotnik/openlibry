import { createTheme, ThemeProvider } from "@mui/material/styles";
import Grid from "@mui/material/Grid";

import {
  Paper,
  TextField,
  FormControl,
  FormControlLabel,
  Checkbox,
  Button,
  IconButton,
  Typography,
} from "@mui/material";
import InputIcon from "@mui/icons-material/Input";
import ListItemIcon from "@mui/material/ListItemIcon";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import Layout from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { getAllUsers, getUser } from "../../entities/user";
import { getRentedBooksForUser } from "@/entities/book";

import SaveAltIcon from "@mui/icons-material/SaveAlt";

import { useRouter } from "next/router";

import { convertDateToDayString } from "@/utils/convertDateToDayString";
import { PrismaClient } from "@prisma/client";
import { updateUser } from "../../entities/user";
import palette from "@/styles/palette";
import { BookType } from "@/entities/BookType";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
  },
});

export default function UserDetail({ user, books }: any) {
  const router = useRouter();

  const [userData, setUserData] = useState(user);
  const [editable, setEditable] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [editButtonLabel, setEditButtonLabel] = useState("Editieren");
  useEffect(() => {
    setUserData(user);
  }, []);

  const userid = parseInt(router.query.userid);
  //console.log("User Page", userid);
  console.log("User, Books", user, books);

  const toggleEditButton = () => {
    editable
      ? setEditButtonLabel("Editieren")
      : setEditButtonLabel("Abbrechen");
    setEditable(!editable);
  };

  const handleSaveButton = () => {
    console.log("Saving user ", userData);
    setSaving(true);

    //we don't need to update the dates
    const { updatedAt, createdAt, ...savingUser } = userData;

    fetch("/api/user/" + userid, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(savingUser),
    })
      .then((res) => res.json())
      .then((data) => {
        setSaving(false);
      });
  };

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <Paper sx={{ mt: 5, px: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="firstName"
                name="firstName"
                label="Vorname"
                defaultValue={userData.firstName}
                disabled={!editable}
                fullWidth
                autoComplete="given-name"
                variant="standard"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setUserData({ ...userData, firstName: event.target.value });
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="lastName"
                name="lastName"
                label="Nachname"
                defaultValue={userData.lastName}
                disabled={!editable}
                fullWidth
                autoComplete="family-name"
                variant="standard"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setUserData({ ...userData, lastName: event.target.value });
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="schoolGrade"
                name="schoolGrade"
                label="Klasse"
                defaultValue={userData.schoolGrade}
                disabled={!editable}
                fullWidth
                autoComplete="shipping address-level2"
                variant="standard"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setUserData({ ...userData, schoolGrade: event.target.value });
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                id="schoolTeacherName"
                name="schoolTeacherName"
                label="Lehrkraft"
                defaultValue={userData.schoolTeacherName}
                disabled={!editable}
                fullWidth
                variant="standard"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setUserData({
                    ...userData,
                    schoolTeacherName: event.target.value,
                  });
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    color="secondary"
                    name="saveActive"
                    disabled={!editable}
                    checked={userData.active}
                    onClick={() => {
                      const toggleValue = !userData.active;
                      setUserData({ ...userData, active: toggleValue });
                    }}
                  />
                }
                label="Aktiv"
              />
            </Grid>
            <Grid container>
              {books.map((b: BookType) => {
                return (
                  <ListItem key={b.id}>
                    <ListItemIcon>
                      <LibraryBooksIcon />
                    </ListItemIcon>
                    <ListItemText>{b.title}</ListItemText>
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
                <Button onClick={handleSaveButton} startIcon={<SaveAltIcon />}>
                  Speichern
                </Button>
              )}
            </Grid>
            <Grid item xs={12} md={4}>
              {editable && (
                <Button startIcon={<DeleteForeverIcon />}>Löschen</Button>
              )}
            </Grid>
          </Grid>
        </Paper>
      </ThemeProvider>
    </Layout>
  );
}

export async function getServerSideProps(context: any) {
  const prisma = new PrismaClient();

  const user = await getUser(prisma, parseInt(context.query.userid));

  user.createdAt = convertDateToDayString(user?.createdAt);
  user.updatedAt = convertDateToDayString(user?.updatedAt);

  const allBooks = user ? await getRentedBooksForUser(prisma, user?.id) : [];

  console.log("User, Books", user, allBooks);
  const books = allBooks.map((b) => {
    const newBook = { ...b } as any; //define a better type there with conversion of Date to string
    newBook.createdAt = convertDateToDayString(b.createdAt);
    newBook.updatedAt = convertDateToDayString(b.updatedAt);
    newBook.rentedDate = b.rentedDate
      ? convertDateToDayString(b.rentedDate)
      : "";
    newBook.dueDate = b.dueDate ? convertDateToDayString(b.dueDate) : "";
    //temp TODO
    return newBook;
  });

  // Pass data to the page via props
  return { props: { user, books } };
}
