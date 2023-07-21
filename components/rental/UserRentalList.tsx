import Grid from "@mui/material/Grid";

import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import Input from "@mui/material/Input";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import AccountCircle from "@mui/icons-material/AccountCircle";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import palette from "@/styles/palette";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import UpdateIcon from "@mui/icons-material/Update";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";

import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";

interface UserPropsType {
  users: Array<UserType>;
  books: Array<BookType>;
  rentals: any;
  handleExtendBookButton: any;
  handleReturnBookButton: any;
}

export default function UserRentalList({
  users,
  books,
  rentals,
  handleExtendBookButton,
  handleReturnBookButton,
}: UserPropsType) {
  const [userSearchInput, setUserSearchInput] = useState("");
  const [selectedUser, setSelectedUser] = useState(users[0]);

  const [displayUserDetail, setDisplayUserDetail] = useState(false);
  const [rentalsUser, setRentalsUser] = useState([]);
  const [returnedBooks, setReturnedBooks] = useState({});

  const handleInputChange = (e: any) => {
    setUserSearchInput(e.target.value);
  };

  const handleSelectedUser = (e: any, u: UserType) => {
    setSelectedUser(u);
    setDisplayUserDetail(true);
    setRentalsUser(booksForUser(u.id!));
    console.log("Selected user", u);
  };

  const booksForUser = (id: number) => {
    const userRentals = rentals.filter((r: any) => parseInt(r.userid) == id);
    console.log("Filtered rentals", userRentals);
    return userRentals;
  };

  const getBookFromID = (id: number): BookType => {
    const book = books.filter((b: BookType) => b.id == id);
    return book[0];
  };

  const ReturnedIcon = ({ id }: any) => {
    //console.log("Rendering icon ", id, returnedBooks);
    if (id in returnedBooks) {
      return <CheckCircleIcon color="success" />;
    } else {
      return <ArrowCircleLeftIcon />;
    }
  };

  const ExtendedIcon = ({ id }: any) => {
    //console.log("Rendering icon ", id, returnedBooks);
    if (id in returnedBooks) {
      return <CheckCircleIcon color="success" />;
    } else {
      return <UpdateIcon />;
    }
  };

  return !displayUserDetail ? (
    <div>
      <FormControl variant="standard">
        <InputLabel htmlFor="user-search-input-label">
          Suche NutzerIn
        </InputLabel>
        <Input
          id="user-search-input"
          startAdornment={
            <InputAdornment position="start">
              <AccountCircle />
            </InputAdornment>
          }
          value={userSearchInput}
          onChange={handleInputChange}
        />
      </FormControl>

      {users.map((u: UserType) => {
        const lowerCaseSearch = userSearchInput.toLowerCase();
        if (
          u.lastName.toLowerCase().includes(lowerCaseSearch) ||
          u.firstName.toLowerCase().includes(lowerCaseSearch) ||
          u.id!.toString().includes(lowerCaseSearch)
        )
          return (
            //display the whole list to select one
            <Grid
              container
              direction="row"
              alignItems="center"
              justifyContent="flex-start  "
              sx={{ px: 10 }}
            >
              <Grid item>
                <IconButton
                  sx={{ p: "10px" }}
                  key={u.id}
                  aria-label="menu"
                  onClick={(e) => handleSelectedUser(e, u)}
                >
                  <CheckBoxOutlineBlankIcon />
                </IconButton>
              </Grid>
              <Grid item>
                <Typography>{u.lastName + ", " + u.firstName}</Typography>
              </Grid>
            </Grid>
          );
      })}
    </div>
  ) : (
    //user detail is activated
    <div>
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <IconButton
            onClick={() => {
              setDisplayUserDetail(false);
            }}
            aria-label="liste"
          >
            <CancelIcon />
          </IconButton>{" "}
          <Typography sx={{ fontSize: 14 }} color="text.primary" gutterBottom>
            {"Nr. " +
              selectedUser.id +
              ", " +
              "Klasse " +
              selectedUser.schoolGrade +
              ", " +
              selectedUser.schoolTeacherName}
          </Typography>
          <Typography variant="h5" component="div" color="text.primary">
            {selectedUser.lastName + ", " + selectedUser.firstName}
          </Typography>
          {rentalsUser.length == 0 ? (
            <Typography color={palette.success.main}>Keine</Typography>
          ) : (
            <Grid
              container
              direction="column"
              alignItems="stretch"
              justifyContent="flex-start"
              sx={{ px: 2, my: 2 }}
            >
              {rentalsUser.map((r) => (
                <Paper key={r.id}>
                  <Grid
                    container
                    direction="row"
                    alignItems="flex-start"
                    justifyContent="flex-start"
                    sx={{ px: 2 }}
                  >
                    <Grid item>
                      <IconButton
                        aria-label="extend"
                        onClick={() => {
                          handleExtendBookButton(r.id, getBookFromID(r.id));
                          const time = Date.now();
                          const newbook = {};
                          (newbook as any)[r.id!] = time;
                          setReturnedBooks({ ...returnedBooks, ...newbook });
                        }}
                      >
                        <ExtendedIcon key={r.id} id={r.id} />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <IconButton
                        onClick={() => {
                          handleReturnBookButton(r.id, selectedUser.id);
                          const time = Date.now();
                          const newbook = {};
                          (newbook as any)[r.id!] = time;
                          setReturnedBooks({ ...returnedBooks, ...newbook });
                        }}
                        aria-label="zurückgeben"
                      >
                        <ReturnedIcon key={r.id} id={r.id} />
                      </IconButton>{" "}
                    </Grid>
                    <Grid item>
                      <Typography sx={{ m: 2 }}>{r.title}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
