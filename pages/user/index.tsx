import Grid from "@mui/material/Grid";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";

import Layout from "@/components/layout/Layout";
import { getAllBooks, getRentedBooksWithUsers } from "@/entities/book";
import { PrismaClient } from "@prisma/client";
import { ChangeEvent, useEffect, useState } from "react";
import { getAllUsers } from "../../entities/user";

import UserAdminList from "@/components/user/UserAdminList";
import QueueIcon from "@mui/icons-material/Queue";
import SearchIcon from "@mui/icons-material/Search";

import dayjs from "dayjs";

import { convertDateToDayString } from "@/utils/dateutils";

import SelectionActions from "@/components/user/SelectionActions";
import UserDetailsCard from "@/components/user/UserDetailsCard";
import { BookType } from "@/entities/BookType";
import { RentalsUserType } from "@/entities/RentalsUserType";
import { UserType } from "@/entities/UserType";
import { increaseNumberInString } from "@/utils/increaseNumberInString";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import {
  Alert,
  Divider,
  IconButton,
  InputBase,
  Paper,
  Snackbar,
  Tooltip,
} from "@mui/material";

const prisma = new PrismaClient();
/*
const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
  },
});
*/
interface UsersPropsType {
  users: Array<UserType>;
  books: Array<BookType>;
  rentals: Array<RentalsUserType>;
}

export default function Users({ users, books, rentals }: UsersPropsType) {
  const [userSearchInput, setUserSearchInput] = useState("");
  const [displayDetail, setDisplayDetail] = useState(0);
  const [userCreating, setUserCreating] = useState(false);
  const [checked, setChecked] = useState({} as any);
  const [batchEditSnackbar, setBatchEditSnackbar] = useState(false);

  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {}, []);

  const handleBatchEditSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setBatchEditSnackbar(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setUserSearchInput(e.target.value);
  };

  const handleCreateNewUser = (e: React.MouseEvent<HTMLElement>) => {
    console.log("Creating a new user");
    setUserCreating(true);
    const user: UserType = { firstName: "", lastName: "", active: true };

    fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    })
      .then((res) => res.json())
      .then((data) => {
        setUserCreating(false);
        router.push("user/" + data.id);
        console.log("User created", data);
      });
  };

  const handleEditUser = (id: string) => {
    console.log("Editing user ", id);
    router.push("user/" + id);
  };

  const handleSelectAll = () => {
    var resultCheck = true;

    //if there is something selected, deselect all
    Object.values(checked).some((value) => value === true)
      ? (resultCheck = false)
      : (resultCheck = true);
    //console.log("Selecting or deselecting all users ", users);
    const newChecked = users.reduce((acc: any, u: any) => {
      if (u.id !== undefined) {
        acc = { ...acc, [u.id]: resultCheck };
      }
      return acc;
    }, {});
    //console.log("New checked users", newChecked);
    setChecked(newChecked);
  };

  const selectItem = (id: string) => {
    console.log("selected user", users, rentals);
    setDisplayDetail(parseInt(id));
  };

  const handleIncreaseGrade = () => {
    //console.log("Increasing grade for users ", users, checked);
    //the user IDs that are checked are marked as true
    const updatedUserIDs = users.reduce((acc: any, u: UserType) => {
      if (checked[u.id!])
        acc.push({ id: u.id, grade: increaseNumberInString(u.schoolGrade) });
      return acc;
    }, []);

    fetch("/api/batch/grade", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUserIDs),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Users increased", data);
        setBatchEditSnackbar(true);
        router.push("user");
      });
  };

  const booksForUser = (id: number) => {
    const userRentals = rentals.filter((r: RentalsUserType) => r.userid == id);
    //console.log("Filtered rentals", userRentals);
    return userRentals;
  };

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <Snackbar
          open={batchEditSnackbar}
          autoHideDuration={4000}
          onClose={handleBatchEditSnackbar}
        >
          <Alert
            onClose={handleBatchEditSnackbar}
            severity="success"
            sx={{ width: "100%", background: "teal", color: "white" }}
          >
            Selektierte Benutzer angepasst, super!
          </Alert>
        </Snackbar>
        <Grid
          container
          direction="column"
          justifyContent="flex-start"
          alignItems="center"
          spacing={2}
          sx={{ mt: 2 }}
        >
          <Grid item>
            <Paper
              component="form"
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: 400,
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                value={userSearchInput}
                onChange={handleInputChange}
                placeholder="NutzerIn suchen.."
                inputProps={{ "aria-label": "search users" }}
                data-cy="rental_input_searchuser"
              />
              <Tooltip title="Suche">
                <IconButton
                  type="button"
                  sx={{ p: "10px" }}
                  aria-label="search"
                >
                  <SearchIcon />
                </IconButton>
              </Tooltip>
              <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
              <Tooltip title="Alle auswählen">
                <IconButton
                  color="primary"
                  sx={{ p: "10px" }}
                  aria-label="new-book"
                  onClick={handleSelectAll}
                >
                  <DoneAllIcon />
                </IconButton>
              </Tooltip>
              <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

              <Tooltip title="Neue Nutzerin erzeugen">
                <IconButton
                  color="primary"
                  sx={{ p: "10px" }}
                  aria-label="new-book"
                  onClick={handleCreateNewUser}
                >
                  <QueueIcon />
                </IconButton>
              </Tooltip>

              <SelectionActions
                checked={checked}
                increaseGrade={handleIncreaseGrade}
              />
            </Paper>
          </Grid>{" "}
          {displayDetail > 0 ? (
            <Grid item xs={6}>
              <UserDetailsCard
                user={users.filter((u) => u.id == displayDetail)[0]}
                rentals={booksForUser(displayDetail)}
              />
            </Grid>
          ) : (
            <div></div>
          )}
          <Grid item xs={6}>
            <UserAdminList
              users={users}
              rentals={rentals}
              searchString={userSearchInput}
              checked={checked}
              setChecked={setChecked}
            />
          </Grid>
        </Grid>
      </ThemeProvider>
    </Layout>
  );
}

export async function getServerSideProps() {
  const allUsers = await getAllUsers(prisma);

  const users = allUsers.map((u) => {
    const newUser = { ...u } as any; //define a better type there with conversion of Date to string
    newUser.createdAt = convertDateToDayString(u.createdAt);
    newUser.updatedAt = convertDateToDayString(u.updatedAt);
    return newUser;
  });

  const allBooks = await getAllBooks(prisma);
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
  const allRentals = await getRentedBooksWithUsers(prisma);
  const rentals = allRentals.map((r) => {
    //calculate remaining days for the rental
    const due = dayjs(r.dueDate);
    const today = dayjs();
    const diff = today.diff(due, "days");
    if (r.user?.lastName == undefined)
      console.log("Fetching rental for undefined user", r);

    return {
      id: r.id,
      title: r.title,
      lastName: r.user?.lastName,
      firstName: r.user?.firstName,
      remainingDays: diff,
      dueDate: convertDateToDayString(due.toDate()),
      renewalCount: r.renewalCount,
      userid: r.user?.id,
    };
  });

  // Pass data to the page via props
  //console.log("Fetched rentals", rentals);
  return { props: { users, books, rentals } };
}
