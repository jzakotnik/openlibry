import { createTheme, ThemeProvider } from "@mui/material/styles";

import Layout from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { getUser } from "../../entities/user";
import { Book } from "@prisma/client";
import { getRentedBooksForUser } from "@/entities/book";

import SaveAltIcon from "@mui/icons-material/SaveAlt";

import { useRouter } from "next/router";

import {
  convertDateToDayString,
  replaceUserDateString,
} from "@/utils/convertDateToDayString";
import { PrismaClient } from "@prisma/client";
import { updateUser } from "../../entities/user";
import palette from "@/styles/palette";
import { BookType } from "@/entities/BookType";
import UserEditForm from "@/components/user/UserEditForm";
import { Typography } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
  },
});

export default function UserDetail({ user, books }: any) {
  const router = useRouter();

  const [userData, setUserData] = useState(user);

  useEffect(() => {
    setUserData(user);
  }, []);

  if (!router.query.userid) {
    return <Typography>ID not found</Typography>;
  }

  const userid = parseInt(
    Array.isArray(router.query.userid)
      ? router.query.userid[0]
      : router.query.userid
  );
  console.log("User Page", userid);
  console.log("User, Books", user, books);

  const handleSaveButton = () => {
    console.log("Saving user ", userData);

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
      .then((data) => {});
  };

  const handleDeleteButton = () => {
    console.log("Deleting user ", userData);

    fetch("/api/user/" + userid, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Delete operation performed on ", userid, data);
        router.push("/user");
      });
  };

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <UserEditForm
          user={userData}
          books={books}
          setUserData={setUserData}
          deleteUser={handleDeleteButton}
          saveUser={handleSaveButton}
        />
      </ThemeProvider>
    </Layout>
  );
}

export async function getServerSideProps(context: any) {
  const prisma = new PrismaClient();

  const dbuser = await getUser(prisma, parseInt(context.query.userid));

  if (!dbuser) return;

  const user = replaceUserDateString(dbuser);

  if (!("id" in user) || !user.id) return; //shouldn't happen

  const allBooks = (await getRentedBooksForUser(prisma, user.id)) as any;

  //TODO fix the type for book incl user

  console.log("User, Books", user, allBooks);
  const books = allBooks.map((b: any) => {
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
