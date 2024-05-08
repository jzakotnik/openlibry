import Layout from "@/components/layout/Layout";
import {
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";
import Button from "@mui/material/Button";
import * as ExcelJS from "exceljs";
import React, { useState } from "react";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
  },
  spacing: 4,
});

export default function XLSImport() {
  const [bookData, setBookData] = useState<any[]>([]);
  const [excelLoaded, setExcelLoaded] = useState(false);

  const [userData, setUserData] = useState<any[]>([]);
  const [importLog, setImportLog] = useState<string[]>(["Los gehts..."]);

  const DenseTable = ({ data }: any) => {
    console.log("Rendering table", data);
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              {data[0].map((d: any, i: number) => {
                return <TableCell key={i}>{d}</TableCell>;
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(1, 10).map((row: any) => (
              <TableRow
                key={row.name}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                {Object.keys(row).map((d: any, i: number) => {
                  return <TableCell key={i}>{row[d]}</TableCell>;
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const convertSheetToJson = (worksheet: any) => {
    const json: any[] = [];
    worksheet.eachRow({ includeEmpty: true }, (row: any, rowNumber: number) => {
      //console.log("Reading row", row);
      const rowValues = row.values as ExcelJS.CellValue[];
      if (rowNumber === 1) {
        // Assuming the first row contains headers
        json.push(rowValues); // Capturing headers
      } else {
        const rowData: any = {};
        rowValues.forEach((value, index) => {
          if (json[0] && json[0][index]) {
            rowData[json[0][index] as string] = value;
          }
        });
        json.push(rowData);
      }
    });
    return json;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const logs = [] as string[];
      const file = event.target.files ? event.target.files[0] : null;
      console.log("Uploading file", event.target.files);
      logs.push("Datei wird geladen: " + file);
      if (!file) return;

      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await file.arrayBuffer();
      logs.push("Excel wird konvertiert");
      await workbook.xlsx.load(arrayBuffer);
      logs.push("Excel erfolgreich konvertiert");

      const worksheetBooks = workbook.worksheets[0];
      logs.push("Excel Blatt für Bücher gefunden");
      const worksheetUsers = workbook.worksheets[1];
      logs.push("Excel Blatt für Nutzer gefunden");

      logs.push("Excel Bücher werden in JSON konvertiert");
      const booksJson: any[] = convertSheetToJson(worksheetBooks);
      logs.push(
        "Excel Bücher erfolgreich in JSON konvertiert: " +
          booksJson.length +
          " Bücher gefunden"
      );
      setBookData(booksJson);
      logs.push("Excel User werden in JSON konvertiert");
      const usersJson: any[] = convertSheetToJson(worksheetUsers);
      logs.push(
        "Excel User erfolgreich in JSON konvertiert: " +
          usersJson.length +
          " User gefunden"
      );
      setUserData(usersJson);

      setExcelLoaded(true);
      setImportLog(logs);
      logs.push(
        "Excel Import erledigt, Daten können in die Datenbank importiert werden."
      );
    } catch (e: any) {
      console.log("Datei Import hat nicht funktioniert");
    }
  };

  const handleImportButton = async () => {
    console.log("Importing data into the db");
    const payload = { bookData: bookData, userData: userData };
    const endpoint = process.env.NEXT_PUBLIC_API_URL + "/api/excel";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    console.log("API Call to database done, response is", result);
    try {
      //take the log content of the api call and add it to the log
      const logs = result.logs as string[];
      setImportLog(importLog.concat(logs));
    } catch (e: any) {
      console.log("Kein Ergebnis der API", result);
    }
  };

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={2}
          sx={{ m: 2 }}
        >
          {" "}
          <Grid
            item
            container
            xs={2}
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}
            sx={{ m: 2 }}
          >
            <Button variant="contained" component="label">
              Excel importieren
              <input
                type="file"
                hidden
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
              />
            </Button>{" "}
            {excelLoaded && (
              <Button
                variant="contained"
                component="label"
                onClick={handleImportButton}
              >
                In die Datenbank importieren
              </Button>
            )}
          </Grid>
          <Grid item xs={10} sx={{ width: "100%" }}>
            {" "}
            <Paper>
              {importLog.map((i: string, idx: number) => (
                <Typography key={idx}>{i}</Typography>
              ))}
            </Paper>
          </Grid>
          {excelLoaded && (
            <Grid container item>
              <Divider></Divider>
              <Typography variant="caption" color="gray">
                Erste Zeilen der Bücher
              </Typography>
              {bookData.length > 0 ? (
                <DenseTable data={bookData} />
              ) : (
                "Keine Daten verfügbar"
              )}
              <Divider></Divider>
              <Typography variant="caption" color="gray">
                Erste Zeilen der User
              </Typography>
              {userData.length > 0 ? (
                <DenseTable data={userData} />
              ) : (
                "Keine Daten verfügbar"
              )}
            </Grid>
          )}
        </Grid>
      </ThemeProvider>
    </Layout>
  );
}
