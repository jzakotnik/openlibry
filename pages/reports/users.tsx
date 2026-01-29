import Layout from "@/components/layout/Layout";
import { prisma } from "@/entities/db";
import { translations } from "@/entities/fieldTranslations";
import { getAllUsers } from "@/entities/user";
import { UserType } from "@/entities/UserType";
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

interface UsersPropsType {
  users: Array<UserType>;
}

const COLUMN_WIDTHS: Record<string, number> = {
  id: 40,
  lastName: 180,
  firstName: 150,
  schoolGrade: 80,
  schoolTeacherName: 150,
  eMail: 200,
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
  sectionTitleInactive: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#fafafa",
    color: "#757575",
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
  tableRowInactive: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#f5f5f5",
  },
  colId: { width: "8%" },
  colLastName: { width: "18%", paddingRight: 4 },
  colFirstName: { width: "18%", paddingRight: 4 },
  colGrade: { width: "10%" },
  colTeacher: { width: "18%", paddingRight: 4 },
  colEmail: { width: "28%", paddingRight: 4 },
  headerText: { color: "#fff", fontWeight: "bold" },
  inactiveText: { color: "#9e9e9e" },
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

interface UsersPdfProps {
  activeUsers: UserType[];
  inactiveUsers: UserType[];
  columns: any[];
}

const UsersPdfDocument = ({
  activeUsers,
  inactiveUsers,
  columns,
}: UsersPdfProps) => {
  const today = new Date().toLocaleDateString("de-DE");

  const getColumnHeader = (field: string) => {
    const col = columns.find((c: any) => c.field === field);
    return col?.headerName || field;
  };

  const TableHeader = () => (
    <View style={pdfStyles.tableHeader}>
      <Text style={[pdfStyles.colId, pdfStyles.headerText]}>
        {getColumnHeader("id")}
      </Text>
      <Text style={[pdfStyles.colLastName, pdfStyles.headerText]}>
        {getColumnHeader("lastName")}
      </Text>
      <Text style={[pdfStyles.colFirstName, pdfStyles.headerText]}>
        {getColumnHeader("firstName")}
      </Text>
      <Text style={[pdfStyles.colGrade, pdfStyles.headerText]}>
        {getColumnHeader("schoolGrade")}
      </Text>
      <Text style={[pdfStyles.colTeacher, pdfStyles.headerText]}>
        {getColumnHeader("schoolTeacherName")}
      </Text>
      <Text style={[pdfStyles.colEmail, pdfStyles.headerText]}>
        {getColumnHeader("eMail")}
      </Text>
    </View>
  );

  const TableRow = ({
    row,
    isInactive,
  }: {
    row: UserType;
    isInactive: boolean;
  }) => (
    <View style={isInactive ? pdfStyles.tableRowInactive : pdfStyles.tableRow}>
      <Text
        style={
          isInactive
            ? [pdfStyles.colId, pdfStyles.inactiveText]
            : pdfStyles.colId
        }
      >
        {row.id}
      </Text>
      <Text
        style={
          isInactive
            ? [pdfStyles.colLastName, pdfStyles.inactiveText]
            : pdfStyles.colLastName
        }
      >
        {String(row.lastName || "").substring(0, 20)}
      </Text>
      <Text
        style={
          isInactive
            ? [pdfStyles.colFirstName, pdfStyles.inactiveText]
            : pdfStyles.colFirstName
        }
      >
        {String(row.firstName || "").substring(0, 20)}
      </Text>
      <Text
        style={
          isInactive
            ? [pdfStyles.colGrade, pdfStyles.inactiveText]
            : pdfStyles.colGrade
        }
      >
        {row.schoolGrade || ""}
      </Text>
      <Text
        style={
          isInactive
            ? [pdfStyles.colTeacher, pdfStyles.inactiveText]
            : pdfStyles.colTeacher
        }
      >
        {String(row.schoolTeacherName || "").substring(0, 20)}
      </Text>
      <Text
        style={
          isInactive
            ? [pdfStyles.colEmail, pdfStyles.inactiveText]
            : pdfStyles.colEmail
        }
      >
        {String(row.eMail || "").substring(0, 30)}
      </Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>Nutzerübersicht</Text>
          <Text style={pdfStyles.subtitle}>
            Erstellt am {today} • {activeUsers.length + inactiveUsers.length}{" "}
            Nutzer gesamt
            {inactiveUsers.length > 0
              ? ` • davon ${inactiveUsers.length} inaktiv`
              : ""}
          </Text>
        </View>

        {/* Active Users Section */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>
            👥 Aktive Nutzer ({activeUsers.length})
          </Text>
          {activeUsers.length > 0 ? (
            <View style={pdfStyles.table}>
              <TableHeader />
              {activeUsers.map((row) => (
                <TableRow key={row.id} row={row} isInactive={false} />
              ))}
            </View>
          ) : (
            <Text style={pdfStyles.emptyMessage}>Keine aktiven Nutzer</Text>
          )}
        </View>

        {/* Inactive Users Section */}
        {inactiveUsers.length > 0 && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitleInactive}>
              Inaktive Nutzer ({inactiveUsers.length})
            </Text>
            <View style={pdfStyles.table}>
              <TableHeader />
              {inactiveUsers.map((row) => (
                <TableRow key={row.id} row={row} isInactive={true} />
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <Text style={pdfStyles.footer}>
          OpenLibry • Nutzerbericht vom {today}
        </Text>
      </Page>
    </Document>
  );
};

/**
 * Export data to PDF and trigger download
 */
async function exportToPdf(columns: any[], rows: UserType[]) {
  // Split into active and inactive
  const activeUsers = rows
    .filter((r) => r.active !== false)
    .sort((a, b) => (a.lastName || "").localeCompare(b.lastName || "", "de"));

  const inactiveUsers = rows
    .filter((r) => r.active === false)
    .sort((a, b) => (a.lastName || "").localeCompare(b.lastName || "", "de"));

  // Generate PDF blob
  const blob = await pdf(
    <UsersPdfDocument
      activeUsers={activeUsers}
      inactiveUsers={inactiveUsers}
      columns={columns}
    />,
  ).toBlob();

  // Download
  const today = new Date().toISOString().split("T")[0];
  const filename = `nutzer_${today}.pdf`;

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

  const sheet = workbook.addWorksheet("Nutzer");

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

    // Highlight inactive users
    if (row.active === false) {
      excelRow.eachCell((cell) => {
        cell.font = { color: { argb: "FF9E9E9E" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF5F5F5" },
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
  const filename = `nutzer_${today}.xlsx`;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function Users({ users }: UsersPropsType) {
  const [reportData, setReportData] = useState<{ columns: any[]; rows: any[] }>(
    {
      columns: [],
      rows: [],
    },
  );
  const [reportDataAvailable, setReportDataAvailable] = useState(false);

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
        return rowCopy;
      });

      if (rows) {
        setReportData({ columns: columns, rows: rows as any });
      }
    }
  }, [users]);

  const handleExcelExport = () => {
    exportToExcel(reportData.columns, reportData.rows);
  };

  const handlePdfExport = () => {
    exportToPdf(reportData.columns, reportData.rows);
  };

  const activeCount = reportData.rows.filter(
    (r: any) => r.active !== false,
  ).length;
  const inactiveCount = reportData.rows.filter(
    (r: any) => r.active === false,
  ).length;
  const totalCount = reportData.rows.length;

  // Count unique classes
  const uniqueGrades = new Set(
    reportData.rows.map((r: any) => r.schoolGrade).filter(Boolean),
  ).size;

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
          data-cy="users-datagrid"
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
                  data-cy="users-status"
                >
                  👥 {totalCount} Nutzer • {uniqueGrades} Klassen
                  {inactiveCount > 0 && (
                    <Typography
                      component="span"
                      sx={{ color: "#757575", fontWeight: "normal", ml: 1 }}
                    >
                      ({inactiveCount} inaktiv)
                    </Typography>
                  )}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={handleExcelExport}
                    data-cy="users-excel-export"
                  >
                    Excel Export
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<PictureAsPdf />}
                    onClick={handlePdfExport}
                    data-cy="users-pdf-export"
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
            <Typography data-cy="users-no-data">
              Keine Daten verfügbar
            </Typography>
          )}
        </Box>
      </ThemeProvider>
    </Layout>
  );
}

export async function getServerSideProps() {
  const allUsers = await getAllUsers(prisma);

  const users = allUsers.map((u) => {
    const newUser = { ...u } as any;
    newUser.createdAt = convertDateToDayString(u.createdAt);
    newUser.updatedAt = convertDateToDayString(u.updatedAt);
    return newUser;
  });

  return { props: { users } };
}
