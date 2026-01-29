import Layout from "@/components/layout/Layout";
import { BookType } from "@/entities/BookType";
import { getAllBooks } from "@/entities/book";
import { prisma } from "@/entities/db";
import { translations } from "@/entities/fieldTranslations";
import { convertDateToDayString } from "@/lib/utils/dateutils";
import { Download, PictureAsPdf } from "@mui/icons-material";
import { Button, Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { deDE as coreDeDE } from "@mui/material/locale";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import { deDE } from "@mui/x-data-grid/locales";
import {
  Document,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import Excel from "exceljs";
import { useEffect, useState } from "react";

const theme = createTheme(
  {
    palette: {
      primary: { main: "#1976d2" },
    },
  },
  deDE,
  coreDeDE,
);

interface BookPropsType {
  books: Array<BookType>;
}

const COLUMN_WIDTHS: Record<string, number> = {
  id: 40,
  title: 350,
  author: 180,
  rentalStatus: 100,
};

const DEFAULT_COLUMN_WIDTH = 100;

function getWidth(columnName: string = ""): number {
  return COLUMN_WIDTHS[columnName] ?? DEFAULT_COLUMN_WIDTH;
}

// =============================================================================
// PDF Styles
// =============================================================================

const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: "#1976d2",
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1976d2",
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
    marginTop: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#e3f2fd",
    color: "#1565c0",
    borderRadius: 2,
  },
  sectionTitleRented: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#fff3e0",
    color: "#e65100",
    borderRadius: 2,
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1976d2",
    padding: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#ffffff",
  },
  tableRowRented: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ffe0b2",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#fff8f0",
  },
  colId: { width: "8%" },
  colTitle: { width: "32%", paddingRight: 4 },
  colAuthor: { width: "20%", paddingRight: 4 },
  colStatus: { width: "12%" },
  colTopics: { width: "28%", paddingRight: 4 },
  headerText: { color: "#fff", fontWeight: "bold" },
  rentedText: { color: "#e65100", fontWeight: "bold" },
  availableText: { color: "#2e7d32" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    color: "#999",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 10,
  },
  emptyMessage: {
    padding: 20,
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
});

// =============================================================================
// PDF Document Component
// =============================================================================

interface BooksPdfProps {
  rentedBooks: BookType[];
  availableBooks: BookType[];
  columns: any[];
}

const BooksPdfDocument = ({
  rentedBooks,
  availableBooks,
  columns,
}: BooksPdfProps) => {
  const today = new Date().toLocaleDateString("de-DE");

  const getColumnHeader = (field: string) => {
    const col = columns.find((c: any) => c.field === field);
    return col?.headerName || field;
  };

  const translateStatus = (status: string): string => {
    const statusTranslations = translations?.rentalStatus as Record<
      string,
      string
    >;
    return statusTranslations?.[status] || status;
  };

  const TableHeader = () => (
    <View style={pdfStyles.tableHeader}>
      <Text style={[pdfStyles.colId, pdfStyles.headerText]}>
        {getColumnHeader("id")}
      </Text>
      <Text style={[pdfStyles.colTitle, pdfStyles.headerText]}>
        {getColumnHeader("title")}
      </Text>
      <Text style={[pdfStyles.colAuthor, pdfStyles.headerText]}>
        {getColumnHeader("author")}
      </Text>
      <Text style={[pdfStyles.colStatus, pdfStyles.headerText]}>
        {getColumnHeader("rentalStatus")}
      </Text>
      <Text style={[pdfStyles.colTopics, pdfStyles.headerText]}>
        {getColumnHeader("topics")}
      </Text>
    </View>
  );

  const TableRow = ({
    row,
    isRented,
  }: {
    row: BookType;
    isRented: boolean;
  }) => (
    <View style={isRented ? pdfStyles.tableRowRented : pdfStyles.tableRow}>
      <Text style={pdfStyles.colId}>{row.id}</Text>
      <Text style={pdfStyles.colTitle}>
        {String(row.title || "").substring(0, 40)}
      </Text>
      <Text style={pdfStyles.colAuthor}>
        {String(row.author || "").substring(0, 25)}
      </Text>
      <Text
        style={
          isRented
            ? [pdfStyles.colStatus, pdfStyles.rentedText]
            : [pdfStyles.colStatus, pdfStyles.availableText]
        }
      >
        {translateStatus(row.rentalStatus)}
      </Text>
      <Text style={pdfStyles.colTopics}>
        {String(row.topics || "").substring(0, 35)}
      </Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>Bestandsübersicht</Text>
          <Text style={pdfStyles.subtitle}>
            Erstellt am {today} • {rentedBooks.length + availableBooks.length}{" "}
            Bücher gesamt
            {rentedBooks.length > 0
              ? ` • davon ${rentedBooks.length} ausgeliehen`
              : ""}
          </Text>
        </View>

        {/* Rented Books Section */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitleRented}>
            📚 Ausgeliehene Bücher ({rentedBooks.length})
          </Text>
          {rentedBooks.length > 0 ? (
            <View style={pdfStyles.table}>
              <TableHeader />
              {rentedBooks.map((row) => (
                <TableRow key={row.id} row={row} isRented={true} />
              ))}
            </View>
          ) : (
            <Text style={pdfStyles.emptyMessage}>Keine Bücher ausgeliehen</Text>
          )}
        </View>

        {/* Available Books Section */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>
            Verfügbare Bücher ({availableBooks.length})
          </Text>
          {availableBooks.length > 0 ? (
            <View style={pdfStyles.table}>
              <TableHeader />
              {availableBooks.map((row) => (
                <TableRow key={row.id} row={row} isRented={false} />
              ))}
            </View>
          ) : (
            <Text style={pdfStyles.emptyMessage}>Keine verfügbaren Bücher</Text>
          )}
        </View>

        {/* Footer */}
        <Text style={pdfStyles.footer}>
          OpenLibry • Bestandsbericht vom {today}
        </Text>
      </Page>
    </Document>
  );
};

/**
 * Export data to PDF and trigger download
 */
async function exportToPdf(columns: any[], rows: BookType[]) {
  // Split into rented and available
  const rentedBooks = rows
    .filter((r) => r.rentalStatus === "rented")
    .sort((a, b) => (a.title || "").localeCompare(b.title || "", "de"));

  const availableBooks = rows
    .filter((r) => r.rentalStatus !== "rented")
    .sort((a, b) => (a.title || "").localeCompare(b.title || "", "de"));

  // Generate PDF blob
  const blob = await pdf(
    <BooksPdfDocument
      rentedBooks={rentedBooks}
      availableBooks={availableBooks}
      columns={columns}
    />,
  ).toBlob();

  // Download
  const today = new Date().toISOString().split("T")[0];
  const filename = `bestand_${today}.pdf`;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Export data to Excel and trigger download
 */
async function exportToExcel(columns: any[], rows: any[]) {
  const workbook = new Excel.Workbook();
  workbook.creator = "OpenLibry";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Bücher");

  // Set up columns from DataGrid columns
  sheet.columns = columns
    .filter((col: any) => col.field !== "__check__")
    .map((col: any) => ({
      header: col.headerName || col.field,
      key: col.field,
      width: Math.max(col.width / 7, 10),
    }));

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });
  headerRow.height = 22;

  // Add data rows
  rows.forEach((row) => {
    const excelRow = sheet.addRow(row);

    // Highlight rented rows
    if (row.rentalStatus === "rented") {
      excelRow.eachCell((cell) => {
        cell.font = { color: { argb: "FFE65100" }, bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFF3E0" },
        };
      });
    }
  });

  // Add autofilter
  if (rows.length > 0) {
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: rows.length + 1, column: columns.length },
    };
  }

  // Freeze header row
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  // Generate file and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const today = new Date().toISOString().split("T")[0];
  const filename = `bestand_${today}.xlsx`;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function Books({ books }: BookPropsType) {
  const [reportData, setReportData] = useState<{ columns: any[]; rows: any[] }>(
    {
      columns: [],
      rows: [],
    },
  );
  const [reportDataAvailable, setReportDataAvailable] = useState(false);

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
        return rowCopy;
      });

      if (rows) {
        setReportData({ columns: columns, rows: rows as any });
      }
    }
  }, [books]);

  const handleExcelExport = () => {
    exportToExcel(reportData.columns, reportData.rows);
  };

  const handlePdfExport = () => {
    exportToPdf(reportData.columns, reportData.rows);
  };

  const rentedCount = reportData.rows.filter(
    (r: any) => r.rentalStatus === "rented",
  ).length;
  const totalCount = reportData.rows.length;

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            backgroundColor: "#CFCFCF",
            width: "100%",
            mt: 5,
            p: 2,
          }}
          data-cy="books-datagrid"
        >
          {reportDataAvailable ? (
            <>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: "#1976d2",
                    fontWeight: "bold",
                  }}
                  data-cy="books-status"
                >
                  📚 {totalCount} Bücher • {rentedCount} ausgeliehen •{" "}
                  {totalCount - rentedCount} verfügbar
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={handleExcelExport}
                    data-cy="books-excel-export"
                  >
                    Excel Export
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<PictureAsPdf />}
                    onClick={handlePdfExport}
                    data-cy="books-pdf-export"
                  >
                    PDF Export
                  </Button>
                </Stack>
              </Stack>
              <DataGrid
                autoHeight
                columns={reportData.columns}
                rows={reportData.rows}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 25 },
                  },
                }}
                pageSizeOptions={[25, 50, 80]}
              />
            </>
          ) : (
            <Typography data-cy="books-no-data">
              Keine Daten verfügbar
            </Typography>
          )}
        </Box>
      </ThemeProvider>
    </Layout>
  );
}

export async function getServerSideProps() {
  const allBooks = await getAllBooks(prisma);
  const books = allBooks.map((b) => {
    const newBook = { ...b } as any;
    newBook.createdAt = convertDateToDayString(b.createdAt);
    newBook.updatedAt = convertDateToDayString(b.updatedAt);
    newBook.rentedDate = b.rentedDate
      ? convertDateToDayString(b.rentedDate)
      : "";
    newBook.dueDate = b.dueDate ? convertDateToDayString(b.dueDate) : "";
    return newBook;
  });
  return { props: { books } };
}
