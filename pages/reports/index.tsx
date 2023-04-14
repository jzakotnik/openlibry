import { createTheme, ThemeProvider } from "@mui/material/styles";
import styles from "@/styles/Home.module.css";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Image from "next/image";
import { deDE as coreDeDE } from "@mui/material/locale";
import SelectReport from "@/components/reports/SelectReport";
import Layout from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { getAllUsers } from "../../entities/user";
import { getAllBooks, getRentedBooksWithUsers } from "@/entities/book";
import { PrismaClient } from "@prisma/client";
import { translations } from "@/entities/fieldTranslations";
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridToolbar,
  deDE,
} from "@mui/x-data-grid";
import dayjs from "dayjs";

import type {} from "@mui/x-data-grid/themeAugmentation";
import { convertDateToDayString } from "@/utils/convertDateToDayString";
import Dashboard from "@/components/reports/Dashboard";

const prisma = new PrismaClient();

const theme = createTheme(
  {
    palette: {
      primary: { main: "#1976d2" },
    },
  },
  deDE, // x-data-grid translations
  coreDeDE // core translations
);

interface ReportPropsType {
  users: any;
  books: any;
  rentals: any;
}

interface ReportKeyType {
  translations: string;
}

export default function Reports({ users, books, rentals }: ReportPropsType) {
  const reportTypes = ["users", "books", "rentals"];
  const [reportType, setReportType] = useState("");
  const [dashboardDisplay, setDashboardDisplay] = useState(true);
  const [reportData, setReportData] = useState({ columns: [], rows: [] });

  //TODO find a better way for dynamic layouts
  function getWidth(columnName: string = "") {
    switch (columnName) {
      case "ID":
        return 40;
        break;
      case "title":
        return 350;
        break;
      case "lastName":
        return 180;
        break;
      default:
        return 100;
    }
  }

  function handleReportType(e: any) {
    //convert the relevant data for the grid

    setReportType(e.target.value);
    setDashboardDisplay(false);
  }

  useEffect(() => {
    if (reportType != "") {
      let data = [] as any;
      reportTypes.map((t) => {
        if (t == reportType) {
          console.log("Type found", reportType);
          data = eval(t);
        }
      });
      const colTitles = data[0];
      const fields = Object.keys(colTitles) as any;
      const columns = fields.map((f: string) => {
        const fieldTranslation = (translations as any)[reportType][f];
        const col = {
          field: f,
          headerName: fieldTranslation,
          width: getWidth(f),
        };
        return col;
      });
      const rows = data.map((r: any) => {
        const rowCopy = {
          id: r.id,
          ...r,
          rentalStatus: (translations.rentalStatus as any)[r.rentalStatus],
        };
        //console.log("Row Copy", rowCopy);
        return rowCopy;
      });
      //console.log("columns", columns);
      setReportData({ columns: columns, rows: rows });
    }
  }, [reportType]);

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <Grid
          container
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={2}
          sx={{ mt: 2 }}
        >
          <Grid item xs={6}>
            <SelectReport
              reportType={reportType}
              handleReportType={handleReportType}
            />
          </Grid>
        </Grid>
        {!dashboardDisplay ? (
          <Box
            sx={{
              backgroundColor: "#CFCFCF",
              width: "100%",
              mt: 5,
            }}
          >
            <DataGrid
              autoHeight
              columns={reportData.columns}
              rows={reportData.rows}
              slots={{ toolbar: GridToolbar }}
            />
          </Box>
        ) : (
          <Dashboard users={users} rentals={rentals} books={books} />
        )}
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
    };
  });

  //console.log(allRentals);

  // Pass data to the page via props
  return { props: { users, books, rentals } };
}
