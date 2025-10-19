import Layout from "@/components/layout/Layout";
import { getRentedBooksWithUsers } from "@/entities/book";
import { translations } from "@/entities/fieldTranslations";
import Box from "@mui/material/Box";
import { deDE as coreDeDE } from "@mui/material/locale";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import { deDE } from "@mui/x-data-grid/locales";
import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import { convertDateToDayString } from "@/utils/dateutils";
import { Typography } from "@mui/material";
import type {} from "@mui/x-data-grid/themeAugmentation";

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

interface RentalsPropsType {
  rentals: any;
}

interface ReportKeyType {
  translations: string;
}

export default function Rentals({ rentals }: RentalsPropsType) {
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
    setReportDataAvailable(rentals.length > 0);
    if (rentals && rentals.length > 0) {
      const colTitles = rentals[0];
      const fields = Object.keys(colTitles) as any;
      const columns = fields.map((f: string) => {
        const fieldTranslation = (translations as any)["rentals"][f];
        const col = {
          field: f,
          headerName: fieldTranslation,
          width: getWidth(f),
        };
        return col;
      });
      const rows = rentals.map((r: any) => {
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
  }, [rentals]);

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
  return { props: { rentals } };
}
