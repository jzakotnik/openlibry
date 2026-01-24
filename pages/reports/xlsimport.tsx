import Layout from "@/components/layout/Layout";
import {
  Alert,
  Box,
  Checkbox,
  CircularProgress,
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
import React, { useCallback, useMemo, useState } from "react";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
  },
  spacing: 4,
});

interface DenseTableProps {
  data: any[];
}

// Moved outside component to avoid recreation on every render
const DenseTable = React.memo(({ data }: DenseTableProps) => {
  if (!data || data.length === 0) {
    return <Typography>Keine Daten verfügbar</Typography>;
  }

  const headers = data[0];

  return (
    <TableContainer component={Paper}>
      <Table
        sx={{ minWidth: 650 }}
        size="small"
        aria-label="data preview table"
      >
        <TableHead>
          <TableRow>
            {headers.map((header: any, i: number) => {
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
                if (i === 0 && !header) return null;
                return <TableCell key={i}>{row[header]}</TableCell>;
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

DenseTable.displayName = "DenseTable";

// Helper to safely parse ID from Excel (handles "001" string format)
const parseId = (value: any): number | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? undefined : parsed;
};

// Helper to safely parse integers with default value
const parseIntOrDefault = (value: any, defaultValue: number = 0): number => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Normalize book data before sending to API
const normalizeBookData = (data: any[]): any[] => {
  if (data.length <= 1) return data; // Only header or empty

  const [headers, ...rows] = data;
  const normalizedRows = rows.map((row: any) => ({
    ...row,
    // Convert ID from string "001" to number 1
    Mediennummer: parseId(row["Mediennummer"]),
    // Default renewalCount to 0 if not specified
    "Anzahl Verlängerungen": parseIntOrDefault(row["Anzahl Verlängerungen"], 0),
  }));

  return [headers, ...normalizedRows];
};

// Normalize user data before sending to API
const normalizeUserData = (data: any[]): any[] => {
  if (data.length <= 1) return data; // Only header or empty

  const [headers, ...rows] = data;
  const normalizedRows = rows.map((row: any) => ({
    ...row,
    // Convert ID from string "001" to number 1
    Nummer: parseId(row["Nummer"]),
  }));

  return [headers, ...normalizedRows];
};

export default function XLSImport() {
  const [bookData, setBookData] = useState<any[]>([]);
  const [userData, setUserData] = useState<any[]>([]);
  const [excelLoaded, setExcelLoaded] = useState(false);
  const [importLog, setImportLog] = useState<string[]>(["Los gehts..."]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<boolean | null>(null);

  // Import option flags
  const [importBooks, setImportBooks] = useState(true);
  const [importUsers, setImportUsers] = useState(true);
  const [dropBeforeImport, setDropBeforeImport] = useState(false);

  // Calculate available counts (excluding header row)
  const bookCount = useMemo(() => Math.max(0, bookData.length - 1), [bookData]);
  const userCount = useMemo(() => Math.max(0, userData.length - 1), [userData]);

  // Determine if checkboxes should be disabled
  const canImportBooks = bookCount > 0;
  const canImportUsers = userCount > 0;

  // Check if import button should be enabled
  const canStartImport = useMemo(() => {
    const hasSelectedBooks = importBooks && canImportBooks;
    const hasSelectedUsers = importUsers && canImportUsers;
    return hasSelectedBooks || hasSelectedUsers;
  }, [importBooks, importUsers, canImportBooks, canImportUsers]);

  const convertSheetToJson = useCallback((worksheet: ExcelJS.Worksheet) => {
    const json: any[] = [];

    // Helper to extract actual value from cell (handles formulas)
    const getCellValue = (cellValue: ExcelJS.CellValue): any => {
      if (cellValue === null || cellValue === undefined) {
        return cellValue;
      }

      // Check if it's a formula result object
      if (typeof cellValue === "object" && "result" in cellValue) {
        return (cellValue as ExcelJS.CellFormulaValue).result;
      }

      // Check if it's a rich text object
      if (typeof cellValue === "object" && "richText" in cellValue) {
        return (cellValue as ExcelJS.CellRichTextValue).richText
          .map((rt) => rt.text)
          .join("");
      }

      // Check if it's a hyperlink object
      if (typeof cellValue === "object" && "hyperlink" in cellValue) {
        return (
          (cellValue as ExcelJS.CellHyperlinkValue).text ||
          (cellValue as ExcelJS.CellHyperlinkValue).hyperlink
        );
      }

      // Check if it's an error object
      if (typeof cellValue === "object" && "error" in cellValue) {
        return null; // or return the error code: (cellValue as ExcelJS.CellErrorValue).error
      }

      return cellValue;
    };

    worksheet.eachRow(
      { includeEmpty: false },
      (row: ExcelJS.Row, rowNumber: number) => {
        const rowValues = row.values as ExcelJS.CellValue[];

        if (rowNumber === 1) {
          // Header row - extract plain values
          const headers = rowValues.map((val) => getCellValue(val));
          json.push(headers);
        } else {
          // Data row
          const rowData: any = {};
          rowValues.forEach((value, index) => {
            if (json[0] && json[0][index]) {
              rowData[json[0][index] as string] = getCellValue(value);
            }
          });
          json.push(rowData);
        }
      },
    );

    return json;
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const logs: string[] = [];
    setIsLoading(true);
    setImportSuccess(null);

    try {
      const file = event.target.files?.[0];
      if (!file) {
        setIsLoading(false);
        return;
      }

      logs.push(
        `Datei wird geladen: ${file.name}, ${(file.size / 1024).toFixed(1)} KB`,
      );

      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await file.arrayBuffer();
      logs.push("Excel wird konvertiert...");
      await workbook.xlsx.load(arrayBuffer);
      logs.push("Excel erfolgreich geladen");

      // Process books worksheet
      const worksheetBooks = workbook.worksheets[0];
      let booksJson: any[] = [];
      if (worksheetBooks) {
        logs.push(`Excel Blatt für Bücher gefunden: "${worksheetBooks.name}"`);
        booksJson = convertSheetToJson(worksheetBooks);
        const foundBooks = Math.max(0, booksJson.length - 1);
        logs.push(`${foundBooks} Bücher gefunden`);
      } else {
        logs.push("⚠️ Kein Blatt für Bücher gefunden (erstes Worksheet)");
      }
      setBookData(booksJson);

      // Process users worksheet
      const worksheetUsers = workbook.worksheets[1];
      let usersJson: any[] = [];
      if (worksheetUsers) {
        logs.push(`Excel Blatt für Nutzer gefunden: "${worksheetUsers.name}"`);
        usersJson = convertSheetToJson(worksheetUsers);
        const foundUsers = Math.max(0, usersJson.length - 1);
        logs.push(`${foundUsers} User gefunden`);
      } else {
        logs.push("⚠️ Kein Blatt für User gefunden (zweites Worksheet)");
      }
      setUserData(usersJson);

      // Auto-set checkboxes based on available data
      const hasBooks = booksJson.length > 1;
      const hasUsers = usersJson.length > 1;
      setImportBooks(hasBooks);
      setImportUsers(hasUsers);

      setExcelLoaded(true);
      logs.push(
        "✓ Excel Import erledigt, Daten können in die Datenbank importiert werden.",
      );
      setImportLog(logs);
    } catch (e: any) {
      logs.push(`❌ Fehler beim Laden: ${e.message || e.toString()}`);
      setImportLog(logs);
      setExcelLoaded(false);
    } finally {
      setIsLoading(false);
      // Reset file input so the same file can be selected again
      event.target.value = "";
    }
  };

  const handleImportButton = async () => {
    setIsImporting(true);
    setImportSuccess(null);

    // Normalize data before sending to API
    const normalizedBookData = importBooks ? normalizeBookData(bookData) : [];
    const normalizedUserData = importUsers ? normalizeUserData(userData) : [];

    const payload = {
      bookData: normalizedBookData,
      userData: normalizedUserData,
      importBooks: importBooks && canImportBooks,
      importUsers: importUsers && canImportUsers,
      dropBeforeImport,
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

      if (response.ok) {
        const logs = result.logs as string[];
        setImportLog((prev) => [
          ...prev,
          "---",
          "Datenbank-Import gestartet:",
          ...logs,
          `✓ Import abgeschlossen: ${result.imported?.books || 0} Bücher, ${
            result.imported?.users || 0
          } User`,
        ]);
        setImportSuccess(true);
      } else {
        const logs = (result.logs as string[]) || [];
        setImportLog((prev) => [
          ...prev,
          "---",
          "❌ Import fehlgeschlagen:",
          ...logs,
          result.data || "Unbekannter Fehler",
        ]);
        setImportSuccess(false);
      }
    } catch (e: any) {
      setImportLog((prev) => [
        ...prev,
        "---",
        `❌ Netzwerk-Fehler beim API-Aufruf: ${e.message || e.toString()}`,
      ]);
      setImportSuccess(false);
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setBookData([]);
    setUserData([]);
    setExcelLoaded(false);
    setImportLog(["Los gehts..."]);
    setImportBooks(true);
    setImportUsers(true);
    setDropBeforeImport(false);
    setImportSuccess(null);
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
          <Box display="flex" flexDirection="row" gap={2} alignItems="center">
            <Button
              variant="contained"
              component="label"
              disabled={isLoading || isImporting}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                  Laden...
                </>
              ) : (
                "Excel importieren"
              )}
              <input
                type="file"
                hidden
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
              />
            </Button>

            {excelLoaded && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleImportButton}
                  disabled={!canStartImport || isImporting}
                >
                  {isImporting ? (
                    <>
                      <CircularProgress
                        size={20}
                        sx={{ mr: 1 }}
                        color="inherit"
                      />
                      Importiere...
                    </>
                  ) : (
                    "In die Datenbank importieren"
                  )}
                </Button>

                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleReset}
                  disabled={isImporting}
                >
                  Zurücksetzen
                </Button>
              </>
            )}
          </Box>

          {/* Success/Error feedback */}
          {importSuccess === true && (
            <Alert severity="success" sx={{ width: "100%" }}>
              Import erfolgreich abgeschlossen!
            </Alert>
          )}
          {importSuccess === false && (
            <Alert severity="error" sx={{ width: "100%" }}>
              Import fehlgeschlagen. Details siehe Log unten.
            </Alert>
          )}

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
                      checked={importBooks && canImportBooks}
                      onChange={(e) => setImportBooks(e.target.checked)}
                      disabled={!canImportBooks || isImporting}
                    />
                  }
                  label={
                    canImportBooks
                      ? `Bücher importieren (${bookCount} gefunden)`
                      : "Bücher importieren (keine Daten vorhanden)"
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={importUsers && canImportUsers}
                      onChange={(e) => setImportUsers(e.target.checked)}
                      disabled={!canImportUsers || isImporting}
                    />
                  }
                  label={
                    canImportUsers
                      ? `User importieren (${userCount} gefunden)`
                      : "User importieren (keine Daten vorhanden)"
                  }
                />
                <Divider sx={{ my: 1 }} />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dropBeforeImport}
                      onChange={(e) => setDropBeforeImport(e.target.checked)}
                      color="warning"
                      disabled={isImporting}
                    />
                  }
                  label="Alle vorhandenen Daten vor Import löschen (VORSICHT!)"
                />
              </FormGroup>
              {dropBeforeImport && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <strong>Warnung:</strong> Alle{" "}
                  {importBooks && importUsers
                    ? "Bücher und User"
                    : importBooks
                      ? "Bücher"
                      : "User"}{" "}
                  in der Datenbank werden vor dem Import gelöscht!
                </Alert>
              )}
              {!canStartImport && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Bitte wählen Sie mindestens eine Import-Option mit verfügbaren
                  Daten.
                </Alert>
              )}
            </Paper>
          )}

          {/* Log panel */}
          <Box sx={{ width: "100%" }}>
            <Paper
              sx={{
                p: 2,
                maxHeight: 300,
                overflow: "auto",
                backgroundColor: "#f5f5f5",
              }}
            >
              <Typography
                variant="subtitle2"
                gutterBottom
                color="textSecondary"
              >
                Import-Log
              </Typography>
              {importLog.map((line: string, idx: number) => (
                <Typography
                  key={idx}
                  variant="body2"
                  sx={{
                    fontFamily: "monospace",
                    color: line.startsWith("❌")
                      ? "error.main"
                      : line.startsWith("✓")
                        ? "success.main"
                        : line.startsWith("⚠️")
                          ? "warning.main"
                          : "text.primary",
                  }}
                >
                  {line}
                </Typography>
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
              <Typography variant="subtitle1">
                Vorschau: Bücher{" "}
                {bookCount > 0 ? `(${bookCount} Einträge)` : "(keine)"}
              </Typography>
              {bookCount > 0 ? (
                <DenseTable data={bookData} />
              ) : (
                <Alert severity="info">
                  Keine Bücher-Daten im Excel gefunden. Stellen Sie sicher, dass
                  das erste Worksheet die Bücherliste enthält.
                </Alert>
              )}

              <Divider />
              <Typography variant="subtitle1">
                Vorschau: User{" "}
                {userCount > 0 ? `(${userCount} Einträge)` : "(keine)"}
              </Typography>
              {userCount > 0 ? (
                <DenseTable data={userData} />
              ) : (
                <Alert severity="info">
                  Keine User-Daten im Excel gefunden. Stellen Sie sicher, dass
                  das zweite Worksheet die Userliste enthält.
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </ThemeProvider>
    </Layout>
  );
}
