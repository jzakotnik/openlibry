import { createTheme, ThemeProvider } from "@mui/material/styles";
import styles from "@/styles/Home.module.css";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { deDE as coreDeDE } from "@mui/material/locale";
import SelectReport from "@/components/reports/SelectReport";
import Layout from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { getAllUsers } from "../../entities/user";
import { PrismaClient } from "@prisma/client";

import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridToolbar,
  deDE,
} from "@mui/x-data-grid";

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

export default function Reports({ data }) {
  const reportTypes = ["user", "books", "rentals"];
  const [reportType, setReportType] = useState("user");
  const [reportData, setReportData] = useState({ columns: [], rows: [] });

  const convertedData = JSON.parse(data);

  function handleReportType(e: any) {
    console.log("Changed type", e.target.value);
    //convert the relevant data for the grid
    setReportType(e.target.value);
  }

  useEffect(() => {
    //convert data to the respective
    const colTitles = convertedData[0];
    //console.log(reportType, convertedData, colTitles);
    const fields = Object.keys(colTitles) as any;
    console.log("Fields", fields);
    const columns = fields.map((f) => {
      const col = { field: f, minWidth: 150 };
      return col;
    });
    const rows = convertedData.map((r) => {
      console.log(r);
      return { id: r.id, ...r };
    });
    console.log("columns", columns);
    setReportData({ columns: columns, rows: rows });
  }, [reportType]);

  console.log("Changed Report Type, getting data for ", reportType);
  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <Box sx={{ mt: 2 }}>
          <SelectReport
            reportType={reportType}
            handleReportType={handleReportType}
          />
        </Box>
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
      </ThemeProvider>
    </Layout>
  );
}

export async function getServerSideProps() {
  const allUsers = await getAllUsers(prisma);
  //convert the dates to scalar sadly
  const data = JSON.stringify(allUsers);
  //console.log("Get Server Side Props", data);

  // Pass data to the page via props
  return { props: { data } };
}
