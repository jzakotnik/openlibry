import Layout from "@/components/layout/Layout";
import { translations } from "@/entities/fieldTranslations";
import Box from "@mui/material/Box";
import { deDE as coreDeDE } from "@mui/material/locale";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import { deDE } from "@mui/x-data-grid/locales";
import { useEffect, useState } from "react";

import { BookType } from "@/entities/BookType";
import { getAllBooks } from "@/entities/book";
import { convertDateToDayString } from "@/utils/dateutils";
import { Typography } from "@mui/material";
import type {} from "@mui/x-data-grid/themeAugmentation";

import { prisma } from "@/entities/db";

const theme = createTheme(
  {
    palette: {
      primary: { main: "#1976d2" },
    },
  },
  deDE, // x-data-grid translations
  coreDeDE // core translations
);

interface BookPropsType {
  books: Array<BookType>;
}

interface ReportKeyType {
  translations: string;
}

export default function Books({ books }: BookPropsType) {
  const [reportData, setReportData] = useState({ columns: [], rows: [] });
  const [reportDataAvailable, setReportDataAvailable] = useState(false);

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

  useEffect(() => {
    setReportDataAvailable(books.length > 0);
    if (books && books.length > 0) {
      const colTitles = books[0];
      const fields = Object.keys(colTitles) as any;
      const columns = fields.map((f: string) => {
        const fieldTranslation = (translations as any)["books"][f];
        const col = {
          field: f,
          headerName: fieldTranslation,
          width: getWidth(f),
        };
        return col;
      });

      const rows = books.map((r: any) => {
        const rowCopy = {
          id: r.id,
          ...r,
        };
        //console.log("Row Copy", rowCopy);
        return rowCopy;
      });
      //console.log("columns", columns);
      if (rows) {
        setReportData({ columns: columns, rows: rows as any }); //TODO do TS magic
      }
    }
  }, [books]);

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            backgroundColor: "#CFCFCF",
            width: "100%",
            mt: 5,
          }}
        >
          {" "}
          {reportDataAvailable ? (
            <DataGrid
              autoHeight
              showToolbar
              columns={reportData.columns}
              rows={reportData.rows}
            />
          ) : (
            <Typography>Keine Daten verfügbar</Typography>
          )}
        </Box>
      </ThemeProvider>
    </Layout>
  );
}

export async function getServerSideProps() {
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
  // Pass data to the page via props
  return { props: { books } };
}
