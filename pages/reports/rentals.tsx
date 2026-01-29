import Layout from "@/components/layout/Layout";
import { getRentedBooksWithUsers } from "@/entities/book";
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
import dayjs from "dayjs";
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

interface RentalData {
  id: number | string;
  title: string;
  lastName?: string;
  firstName?: string;
  remainingDays: number;
  dueDate: string;
  renewalCount: number;
  userid?: number | string;
  schoolGrade?: string;
  rentalStatus?: string;
}

interface RentalsPropsType {
  rentals: RentalData[];
  error?: string;
}

const COLUMN_WIDTHS: Record<string, number> = {
  ID: 20,
  title: 250,
  lastName: 180,
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
  sectionTitleOverdue: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#ffebee",
    color: "#c62828",
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
  tableRowOverdue: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ffcdd2",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#fff8f8",
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  colId: { width: "7%" },
  colTitle: { width: "25%", paddingRight: 4 },
  colName: { width: "16%", paddingRight: 4 },
  colGrade: { width: "7%" },
  colDue: { width: "11%" },
  colDays: { width: "22%" },
  colRenewal: { width: "12%", textAlign: "center" },
  headerText: { color: "#fff", fontWeight: "bold" },
  overdueText: { color: "#c62828", fontWeight: "bold" },
  okText: { color: "#2e7d32" },
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

interface RentalsPdfProps {
  overdueRentals: RentalData[];
  regularRentals: RentalData[];
  columns: any[];
}

const RentalsPdfDocument = ({
  overdueRentals,
  regularRentals,
  columns,
}: RentalsPdfProps) => {
  const today = new Date().toLocaleDateString("de-DE");

  const getColumnHeader = (field: string) => {
    const col = columns.find((c) => c.field === field);
    return col?.headerName || field;
  };

  const TableHeader = () => (
    <View style={pdfStyles.tableHeader}>
      <Text style={[pdfStyles.colId, pdfStyles.headerText]}>
        {getColumnHeader("id")}
      </Text>
      <Text style={[pdfStyles.colTitle, pdfStyles.headerText]}>
        {getColumnHeader("title")}
      </Text>
      <Text style={[pdfStyles.colName, pdfStyles.headerText]}>Name</Text>
      <Text style={[pdfStyles.colGrade, pdfStyles.headerText]}>
        {getColumnHeader("schoolGrade")}
      </Text>
      <Text style={[pdfStyles.colDue, pdfStyles.headerText]}>
        {getColumnHeader("dueDate")}
      </Text>
      <Text style={[pdfStyles.colDays, pdfStyles.headerText]}>Verzug</Text>
      <Text style={[pdfStyles.colRenewal, pdfStyles.headerText]}>
        {getColumnHeader("renewalCount")}
      </Text>
    </View>
  );

  const formatRemainingDays = (days: number): string => {
    if (days < 0) {
      return `${Math.abs(days)} Tag${Math.abs(days) !== 1 ? "e" : ""} überfällig`;
    } else if (days === 0) {
      return "Heute fällig";
    } else {
      return `noch ${days} Tag${days !== 1 ? "e" : ""}`;
    }
  };

  const TableRow = ({
    row,
    isOverdue,
  }: {
    row: RentalData;
    isOverdue: boolean;
  }) => (
    <View style={isOverdue ? pdfStyles.tableRowOverdue : pdfStyles.tableRow}>
      <Text style={pdfStyles.colId}>{row.id}</Text>
      <Text style={pdfStyles.colTitle}>
        {String(row.title || "").substring(0, 30)}
      </Text>
      <Text style={pdfStyles.colName}>
        {`${row.lastName || ""}, ${row.firstName || ""}`.substring(0, 18)}
      </Text>
      <Text style={pdfStyles.colGrade}>{row.schoolGrade || ""}</Text>
      <Text style={pdfStyles.colDue}>{row.dueDate}</Text>
      <Text
        style={
          isOverdue
            ? [pdfStyles.colDays, pdfStyles.overdueText]
            : [pdfStyles.colDays, pdfStyles.okText]
        }
      >
        {formatRemainingDays(row.remainingDays)}
      </Text>
      <Text style={pdfStyles.colRenewal}>
        {row.renewalCount > 0 ? `${row.renewalCount}x` : "-"}
      </Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>Ausleihübersicht</Text>
          <Text style={pdfStyles.subtitle}>
            Erstellt am {today} •{" "}
            {overdueRentals.length + regularRentals.length} Ausleihen gesamt
            {overdueRentals.length > 0
              ? ` • davon ${overdueRentals.length} überfällig`
              : ""}
          </Text>
        </View>

        {/* Overdue Section */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitleOverdue}>
            ⚠ Überfällige Ausleihen ({overdueRentals.length})
          </Text>
          {overdueRentals.length > 0 ? (
            <View style={pdfStyles.table}>
              <TableHeader />
              {overdueRentals.map((row) => (
                <TableRow key={row.id} row={row} isOverdue={true} />
              ))}
            </View>
          ) : (
            <Text style={pdfStyles.emptyMessage}>
              Keine überfälligen Ausleihen
            </Text>
          )}
        </View>

        {/* Regular Rentals Section */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>
            Aktuelle Ausleihen ({regularRentals.length})
          </Text>
          {regularRentals.length > 0 ? (
            <View style={pdfStyles.table}>
              <TableHeader />
              {regularRentals.map((row) => (
                <TableRow key={row.id} row={row} isOverdue={false} />
              ))}
            </View>
          ) : (
            <Text style={pdfStyles.emptyMessage}>
              Keine aktuellen Ausleihen
            </Text>
          )}
        </View>

        {/* Footer */}
        <Text style={pdfStyles.footer}>
          OpenLibry • Ausleihbericht vom {today}
        </Text>
      </Page>
    </Document>
  );
};

/**
 * Export data to PDF and trigger download
 */
async function exportToPdf(columns: any[], rows: RentalData[]) {
  // Split into overdue and regular
  const overdueRentals = rows
    .filter((r) => r.remainingDays < 0)
    .sort((a, b) => a.remainingDays - b.remainingDays); // Most overdue first

  const regularRentals = rows
    .filter((r) => r.remainingDays >= 0)
    .sort((a, b) => a.remainingDays - b.remainingDays); // Soonest due first

  // Generate PDF blob
  const blob = await pdf(
    <RentalsPdfDocument
      overdueRentals={overdueRentals}
      regularRentals={regularRentals}
      columns={columns}
    />,
  ).toBlob();

  // Download
  const today = new Date().toISOString().split("T")[0];
  const filename = `ausleihen_${today}.pdf`;

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

  const sheet = workbook.addWorksheet("Ausleihen");

  // Set up columns from DataGrid columns
  sheet.columns = columns
    .filter((col) => col.field !== "__check__")
    .map((col) => ({
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

    // Highlight overdue rows (negative remaining days)
    if (row.remainingDays < 0) {
      excelRow.eachCell((cell) => {
        cell.font = { color: { argb: "FFCC0000" }, bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFCE4D6" },
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
  const filename = `ausleihen_${today}.xlsx`;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function Rentals({ rentals, error }: RentalsPropsType) {
  const [reportData, setReportData] = useState<{
    columns: any[];
    rows: RentalData[];
  }>({ columns: [], rows: [] });
  const [reportDataAvailable, setReportDataAvailable] = useState(false);

  useEffect(() => {
    if (error || !rentals) {
      setReportDataAvailable(false);
      return;
    }

    setReportDataAvailable(rentals.length > 0);

    if (rentals.length > 0) {
      try {
        const colTitles = rentals[0];
        const fields = Object.keys(colTitles);

        const columns = fields.map((f: string) => {
          const rentalTranslations = translations?.rentals;
          const fieldTranslation =
            rentalTranslations && typeof rentalTranslations === "object"
              ? (rentalTranslations as Record<string, string>)[f] || f
              : f;

          return {
            field: f,
            headerName: fieldTranslation,
            width: getWidth(f),
          };
        });

        const rows = rentals.map((r: RentalData) => {
          const statusTranslations = translations?.rentalStatus;
          const translatedStatus =
            statusTranslations &&
            typeof statusTranslations === "object" &&
            r.rentalStatus
              ? (statusTranslations as Record<string, string>)[
                  r.rentalStatus
                ] || r.rentalStatus
              : r.rentalStatus;

          return {
            ...r,
            id: r.id,
            rentalStatus: translatedStatus,
          };
        });

        setReportData({ columns, rows });
      } catch (err) {
        console.error("Error processing rental data:", err);
        setReportDataAvailable(false);
      }
    }
  }, [rentals, error]);

  const handleExcelExport = () => {
    exportToExcel(reportData.columns, reportData.rows);
  };

  const handlePdfExport = () => {
    exportToPdf(reportData.columns, reportData.rows);
  };

  const overdueCount = reportData.rows.filter(
    (r) => r.remainingDays < 0,
  ).length;

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
          data-cy="rentals-datagrid"
        >
          {error ? (
            <Typography color="error" data-cy="rentals-error">
              Fehler beim Laden der Daten: {error}
            </Typography>
          ) : reportDataAvailable ? (
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
                    color: overdueCount > 0 ? "#c62828" : "#2e7d32",
                    fontWeight: "bold",
                  }}
                  data-cy="rentals-overdue-count"
                >
                  {overdueCount > 0
                    ? `⚠ ${overdueCount} Buch${overdueCount !== 1 ? "er" : ""} überfällig`
                    : "✓ Keine überfälligen Bücher"}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={handleExcelExport}
                    data-cy="rentals-excel-export"
                  >
                    Excel Export
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<PictureAsPdf />}
                    onClick={handlePdfExport}
                    data-cy="rentals-pdf-export"
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
            <Typography data-cy="rentals-no-data">
              Keine Daten verfügbar
            </Typography>
          )}
        </Box>
      </ThemeProvider>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    const allRentals = await getRentedBooksWithUsers(prisma);

    if (!allRentals || !Array.isArray(allRentals)) {
      return {
        props: {
          rentals: [],
          error: "Ungültige Daten vom Server erhalten",
        },
      };
    }

    const rentals = allRentals.map((r) => {
      const due = r.dueDate ? dayjs(r.dueDate) : dayjs();
      const today = dayjs();
      const diff = due.diff(today, "days");

      return {
        id: r.id,
        title: r.title || "Unbekannter Titel",
        lastName: r.user?.lastName || "Unbekannt",
        firstName: r.user?.firstName || "Unbekannt",
        remainingDays: diff,
        dueDate: convertDateToDayString(due.toDate()),
        renewalCount: r.renewalCount ?? 0,
        userid: r.user?.id,
        schoolGrade: r.user?.schoolGrade || "0",
      };
    });

    return {
      props: {
        rentals: JSON.parse(JSON.stringify(rentals)),
      },
    };
  } catch (error) {
    console.error("Error fetching rentals:", error);

    return {
      props: {
        rentals: [],
        error: "Fehler beim Laden der Ausleihdaten",
      },
    };
  }
}
