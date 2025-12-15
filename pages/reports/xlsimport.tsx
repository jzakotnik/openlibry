import Layout from "@/components/layout/Layout";
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
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

  // Import option flags
  const [importBooks, setImportBooks] = useState(true);
  const [importUsers, setImportUsers] = useState(true);
  const [dropBeforeImport, setDropBeforeImport] = useState(false);

  const DenseTable = ({ data }: any) => {
    console.log("Rendering table", data);

    if (!data || data.length === 0) {
      return <Typography>Keine Daten verfügbar</Typography>;
    }

    // Extract headers from first row
    const headers = data[0];

    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              {headers.map((header: any, i: number) => {
                // Skip the first undefined/null column that comes from Excel
                if (i === 0 && !header) return null;
                return <TableCell key={i}>{header}</TableCell>;
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(1, 10).map((row: any, rowIndex: number) => (
              <TableRow
                key={rowIndex}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                {headers.map((header: any, i: number) => {
                  // Skip the first undefined/null column
                  if (i === 0 && !header) return null;
                  return <TableCell key={i}>{row[header]}</TableCell>;
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
    worksheet.eachRow(
      { includeEmpty: false },
      (row: any, rowNumber: number) => {
        const rowValues = row.values as ExcelJS.CellValue[];
        if (rowNumber === 1) {
          json.push(rowValues);
        } else {
          const rowData: any = {};
          rowValues.forEach((value, index) => {
            if (json[0] && json[0][index]) {
              rowData[json[0][index] as string] = value;
            }
          });
          json.push(rowData);
        }
      }
    );
    return json;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const logs = [] as string[];
    try {
      console.log("Check file", event.target);
      const file = event.target.files ? event.target.files[0] : null;
      console.log("Uploading file", event.target.files);
      logs.push("Datei wird geladen: " + file);
      if (!file) return;

      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await file.arrayBuffer();
      logs.push("Excel wird konvertiert");
      const loaded = await workbook.xlsx.load(arrayBuffer);
      logs.push("Excel erfolgreich konvertiert" + loaded.toString());

      const worksheetBooks = workbook.worksheets[0];
      logs.push("Excel Blatt für Bücher gefunden");
      const worksheetUsers = workbook.worksheets[1];
      logs.push("Excel Blatt für Nutzer gefunden");

      logs.push("Excel Bücher werden in JSON konvertiert");
      const booksJson: any[] = convertSheetToJson(worksheetBooks);
      logs.push(
        "Excel Bücher erfolgreich in JSON konvertiert: " +
          (booksJson.length - 1) + //skip header line
          " Bücher gefunden"
      );
      setBookData(booksJson);
      logs.push("Excel User werden in JSON konvertiert");
      const usersJson: any[] = convertSheetToJson(worksheetUsers);
      logs.push(
        "Excel User erfolgreich in JSON konvertiert: " +
          (usersJson.length - 1) + // skip the header line
          " User gefunden"
      );
      setUserData(usersJson);

      setExcelLoaded(true);
      setImportLog(logs);
      logs.push(
        "Excel Import erledigt, Daten können in die Datenbank importiert werden."
      );
    } catch (e: any) {
      console.log("Datei Import hat nicht funktioniert", logs, e);
    }
  };

  const handleImportButton = async () => {
    console.log("Importing data into the db with options:", {
      importBooks,
      importUsers,
      dropBeforeImport,
    });

    const payload = {
      bookData: bookData,
      userData: userData,
      importBooks: importBooks,
      importUsers: importUsers,
      dropBeforeImport: dropBeforeImport,
    };

    try {
      const response = await fetch("/api/excel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      console.log("API Call to database done, response is", result);

      // Take the log content of the api call and add it to the log
      const logs = result.logs as string[];
      setImportLog(importLog.concat(logs));
    } catch (e: any) {
      console.log("Kein Ergebnis der API, Error, Payload:", e, payload);
      setImportLog([...importLog, "Fehler beim API-Aufruf: " + e.toString()]);
    }
  };

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={2}
          sx={{ m: 2, width: "100%" }}
        >
          {/* Button row */}
          <Box display="flex" flexDirection="row" gap={2}>
            <Button variant="contained" component="label">
              Excel importieren
              <input
                type="file"
                hidden
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
              />
            </Button>

            {excelLoaded && (
              <Button variant="contained" onClick={handleImportButton}>
                In die Datenbank importieren
              </Button>
            )}
          </Box>

          {/* Import options */}
          {excelLoaded && (
            <Paper sx={{ p: 2, width: "100%" }}>
              <Typography variant="h6" gutterBottom>
                Import-Optionen
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={importBooks}
                      onChange={(e) => setImportBooks(e.target.checked)}
                    />
                  }
                  label={`Bücher importieren (${bookData.length - 1} gefunden)`}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={importUsers}
                      onChange={(e) => setImportUsers(e.target.checked)}
                    />
                  }
                  label={`User importieren (${userData.length - 1} gefunden)`}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dropBeforeImport}
                      onChange={(e) => setDropBeforeImport(e.target.checked)}
                      color="warning"
                    />
                  }
                  label="Alle vorhandenen Daten vor Import löschen (VORSICHT!)"
                />
              </FormGroup>
              {dropBeforeImport && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  ⚠️ Warnung: Alle ausgewählten Daten in der Datenbank werden
                  gelöscht!
                </Typography>
              )}
            </Paper>
          )}

          {/* Log panel */}
          <Box sx={{ width: "100%" }}>
            <Paper sx={{ p: 2 }}>
              {importLog.map((i: string, idx: number) => (
                <Typography key={idx}>{i}</Typography>
              ))}
            </Paper>
          </Box>

          {/* Data preview */}
          {excelLoaded && (
            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              sx={{ width: "100%" }}
            >
              <Divider />
              <Typography variant="caption" color="gray">
                Erste Zeilen der Bücher
              </Typography>
              {bookData.length > 0 ? (
                <DenseTable data={bookData} />
              ) : (
                "Keine Daten verfügbar"
              )}

              <Divider />
              <Typography variant="caption" color="gray">
                Erste Zeilen der User
              </Typography>
              {userData.length > 0 ? (
                <DenseTable data={userData} />
              ) : (
                "Keine Daten verfügbar"
              )}
            </Box>
          )}
        </Box>
      </ThemeProvider>
    </Layout>
  );
}
