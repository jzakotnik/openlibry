import Layout from "@/components/layout/Layout";
import { prisma } from "@/entities/db";
import { translations } from "@/entities/fieldTranslations";
import Box from "@mui/material/Box";
import { deDE as coreDeDE } from "@mui/material/locale";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import { deDE } from "@mui/x-data-grid/locales";
import { useEffect, useState } from "react";

import { UserType } from "@/entities/UserType";
import { getAllUsers } from "@/entities/user";
import { convertDateToDayString } from "@/utils/dateutils";
import { Typography } from "@mui/material";
import type {} from "@mui/x-data-grid/themeAugmentation";

const theme = createTheme(
  {
    palette: {
      primary: { main: "#1976d2" },
    },
  },
  deDE, // x-data-grid translations
  coreDeDE // core translations
);

interface UsersPropsType {
  users: Array<UserType>;
}

interface ReportKeyType {
  translations: string;
}

export default function Users({ users }: UsersPropsType) {
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
    setReportDataAvailable(users.length > 0);
    if (users && users.length > 0) {
      const colTitles = users[0];
      const fields = Object.keys(colTitles) as any;
      const columns = fields.map((f: string) => {
        const fieldTranslation = (translations as any)["users"][f];
        const col = {
          field: f,
          headerName: fieldTranslation,
          width: getWidth(f),
        };
        return col;
      });

      const rows = users.map((r: any) => {
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
  }, [users]);

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
  const allUsers = await getAllUsers(prisma);

  const users = allUsers.map((u) => {
    const newUser = { ...u } as any; //define a better type there with conversion of Date to string
    newUser.createdAt = convertDateToDayString(u.createdAt);
    newUser.updatedAt = convertDateToDayString(u.updatedAt);
    return newUser;
  });

  //console.log(allRentals);

  // Pass data to the page via props
  return { props: { users } };
}
