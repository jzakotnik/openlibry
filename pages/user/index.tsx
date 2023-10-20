import Grid from "@mui/material/Grid";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";

import Layout from "@/components/layout/Layout";
import { getAllBooks, getRentedBooksWithUsers } from "@/entities/book";
import { PrismaClient } from "@prisma/client";
import { useEffect, useState } from "react";
import { getAllUsers } from "../../entities/user";

import UserAdminList from "@/components/user/UserAdminList";
import QueueIcon from "@mui/icons-material/Queue";
import SearchIcon from "@mui/icons-material/Search";

import dayjs from "dayjs";

import { convertDateToDayString } from "@/utils/convertDateToDayString";

import UserDetailsCard from "@/components/user/UserDetailsCard";
import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import { Divider, IconButton, InputBase, Paper, Tooltip } from "@mui/material";

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
  rentals: any;
}

export default function Users({ users, books, rentals }: UsersPropsType) {
  const [userSearchInput, setUserSearchInput] = useState("");
  const [displayDetail, setDisplayDetail] = useState(0);
  const [userCreating, setUserCreating] = useState(false);

  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {}, []);

  const handleInputChange = (e: any) => {
    setUserSearchInput(e.target.value);
  };

  const handleCreateNewUser = (e: any) => {
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

  const selectItem = (id: string) => {
    console.log("selected user", users, rentals);
    setDisplayDetail(parseInt(id));
  };

  const booksForUser = (id: number) => {
    const userRentals = rentals.filter((r: any) => parseInt(r.userid) == id);
    //console.log("Filtered rentals", userRentals);
    return userRentals;
  };

  return (
    <Layout>
      <ThemeProvider theme={theme}>
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
              selectItem={selectItem}
              handleEditUser={handleEditUser}
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
