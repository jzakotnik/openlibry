import Layout from "@/components/layout/Layout";
import { getAllBooks, getRentedBooksWithUsers } from "@/entities/book";
import { deDE as coreDeDE } from "@mui/material/locale";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { deDE } from "@mui/x-data-grid";
import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import { getAllUsers } from "../../entities/user";

import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import { convertDateToDayString } from "@/utils/dateutils";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import type {} from "@mui/x-data-grid/themeAugmentation";
import router from "next/router";
import { useState } from "react";

const prisma = new PrismaClient();

const theme = createTheme(
  {
    palette: {
      primary: { main: "#1976d2" },
    },
    spacing: 4,
  },
  deDE, // x-data-grid translations
  coreDeDE // core translations
);

interface ReportPropsType {
  users: Array<UserType>;
  books: Array<BookType>;
  rentals: any;
}

type ReportCardProps = {
  title: string;
  subtitle: string;
  unit: string;
  link: string;
  startLabel?: number;
  setStartLabel?: any;
  totalNumber: number;
};

const LabelCard = ({
  title,
  subtitle,
  link,
  startLabel,
  totalNumber,
  setStartLabel,
}: ReportCardProps) => {
  return (
    <Card variant="outlined" sx={{ minWidth: 275, minHeight: 250 }}>
      <CardContent>
        <Typography variant="h5" component="div">
          {title}
        </Typography>

        <TextField
          id="outlined-number"
          label="Anzahl Etiketten"
          key="book_report_number_input"
          type="number"
          value={startLabel}
          error={startLabel! > totalNumber}
          helperText={
            startLabel! > totalNumber ? "So viele Bücher gibt es nicht?" : ""
          }
          onChange={(e: any) => {
            setStartLabel(parseInt(e.target.value));
          }}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ mt: 5 }}
        />

        <Typography variant="body2">{subtitle}</Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          onClick={() =>
            router.push(link + "/?start=0" + "&end=" + Math.floor(startLabel!))
          }
        >
          Erzeuge PDF
        </Button>
      </CardActions>
    </Card>
  );
};

export default function Excelexport({
  users,
  books,
  rentals,
}: ReportPropsType) {
  const [startLabel, setStartLabel] = useState(100);

  const ReportCard = ({
    title,
    subtitle,
    unit,
    link,
    totalNumber,
  }: ReportCardProps) => {
    return (
      <Card variant="outlined" sx={{ minWidth: 275, minHeight: 250 }}>
        <CardContent>
          <Typography variant="h5" component="div">
            {title}
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            {totalNumber}
          </Typography>
          <Typography variant="body2">{subtitle}</Typography>
        </CardContent>
        <CardActions>
          <Button size="small" onClick={() => router.push(link)}>
            Erzeuge Tabelle
          </Button>
        </CardActions>
      </Card>
    );
  };

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <Typography>Work in progress</Typography>
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

  //console.log(allRentals);

  // Pass data to the page via props
  return { props: { users, books, rentals } };
}
