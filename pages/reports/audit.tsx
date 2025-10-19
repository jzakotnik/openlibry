import Layout from "@/components/layout/Layout";
import { translations } from "@/entities/fieldTranslations";
import Box from "@mui/material/Box";
import { deDE as coreDeDE } from "@mui/material/locale";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import { deDE } from "@mui/x-data-grid/locales";
import { PrismaClient } from "@prisma/client";
import { useEffect, useState } from "react";

import { AuditType } from "@/entities/AuditType";
import { getAllAudit } from "@/entities/audit";
import { convertDateToTimeString } from "@/utils/dateutils";
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

interface AuditPropsType {
  audits: Array<AuditType>;
}

interface ReportKeyType {
  translations: string;
}

export default function Audit({ audits }: AuditPropsType) {
  const [reportData, setReportData] = useState({ columns: [], rows: [] });
  const [reportDataAvailable, setReportDataAvailable] = useState(false);

  //TODO find a better way for dynamic layouts
  function getWidth(columnName: string = "") {
    switch (columnName) {
      case "id":
        return 20;
        break;
      case "eventType":
        return 150;
        break;
      case "eventContent":
        return 280;
        break;
      default:
        return 150;
    }
  }

  useEffect(() => {
    setReportDataAvailable(audits.length > 0);
    if (audits && audits.length > 0) {
      const colTitles = audits[0];
      const fields = Object.keys(colTitles) as any;
      const columns = fields.map((f: string) => {
        const fieldTranslation = (translations as any)["audits"][f];
        const col = {
          field: f,
          headerName: fieldTranslation,
          width: getWidth(f),
        };
        return col;
      });

      const rows = audits.map((r: any) => {
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
  }, [audits]);

  console.log("Audits received: ", reportDataAvailable, audits);

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
  const allAudits = await getAllAudit(prisma);

  const audits = allAudits.map((a: AuditType) => {
    const newAudit = { ...a } as any; //define a better type there with conversion of Date to string
    newAudit.createdAt = convertDateToTimeString(a.createdAt);
    newAudit.updatedAt = convertDateToTimeString(a.updatedAt);
    return newAudit;
  });

  //console.log(allRentals);

  // Pass data to the page via props
  return { props: { audits } };
}
