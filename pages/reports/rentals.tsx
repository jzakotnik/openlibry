import Layout from "@/components/layout/Layout";
import { getRentedBooksWithUsers } from "@/entities/book";
import { prisma } from "@/entities/db";
import { translations } from "@/entities/fieldTranslations";
import { convertDateToDayString } from "@/lib/utils/dateutils";
import {
  Document,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import dayjs from "dayjs";
import Excel from "exceljs";
import { Download, FileText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// =============================================================================
// Column width config
// =============================================================================

const COLUMN_WIDTHS: Record<string, number> = {
  id: 40,
  title: 250,
  lastName: 180,
  firstName: 140,
  remainingDays: 120,
  dueDate: 120,
  renewalCount: 100,
  userid: 60,
  schoolGrade: 80,
  rentalStatus: 100,
};

const DEFAULT_COLUMN_WIDTH = 100;

function getWidth(columnName: string = ""): number {
  return COLUMN_WIDTHS[columnName] ?? DEFAULT_COLUMN_WIDTH;
}

// =============================================================================
// Types
// =============================================================================

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
  columns: { field: string; headerName: string }[];
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

// =============================================================================
// Excel & PDF export functions
// =============================================================================

async function exportToPdf(
  columns: { field: string; headerName: string }[],
  rows: RentalData[],
) {
  const overdueRentals = rows
    .filter((r) => r.remainingDays < 0)
    .sort((a, b) => a.remainingDays - b.remainingDays);

  const regularRentals = rows
    .filter((r) => r.remainingDays >= 0)
    .sort((a, b) => a.remainingDays - b.remainingDays);

  const blob = await pdf(
    <RentalsPdfDocument
      overdueRentals={overdueRentals}
      regularRentals={regularRentals}
      columns={columns}
    />,
  ).toBlob();

  const today = new Date().toISOString().split("T")[0];
  const filename = `ausleihen_${today}.pdf`;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function exportToExcel(
  columns: { field: string; headerName: string; width?: number }[],
  rows: any[],
) {
  const workbook = new Excel.Workbook();
  workbook.creator = "OpenLibry";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Ausleihen");

  sheet.columns = columns
    .filter((col) => col.field !== "__check__")
    .map((col) => ({
      header: col.headerName || col.field,
      key: col.field,
      width: Math.max((col.width || 100) / 7, 10),
    }));

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

  rows.forEach((row) => {
    const excelRow = sheet.addRow(row);
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

  if (rows.length > 0) {
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: rows.length + 1, column: columns.length },
    };
  }

  sheet.views = [{ state: "frozen", ySplit: 1 }];

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

// =============================================================================
// Page component
// =============================================================================

export default function Rentals({ rentals, error }: RentalsPropsType) {
  const [reportColumns, setReportColumns] = useState<
    { field: string; headerName: string; width: number }[]
  >([]);
  const [reportRows, setReportRows] = useState<RentalData[]>([]);
  const [reportDataAvailable, setReportDataAvailable] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

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

        const cols = fields.map((f: string) => {
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

        setReportColumns(cols);
        setReportRows(rows);
      } catch (err) {
        console.error("Error processing rental data:", err);
        setReportDataAvailable(false);
      }
    }
  }, [rentals, error]);

  // Build TanStack columns from the dynamic field list
  const tanstackColumns = useMemo<ColumnDef<any>[]>(() => {
    return reportColumns.map((col) => ({
      accessorKey: col.field,
      header: col.headerName ?? col.field,
      size: col.width,
    }));
  }, [reportColumns]);

  const table = useReactTable({
    data: reportRows,
    columns: tanstackColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 25 },
    },
  });

  const handleExcelExport = () => {
    exportToExcel(reportColumns, reportRows);
  };

  const handlePdfExport = () => {
    exportToPdf(reportColumns, reportRows);
  };

  const overdueCount = reportRows.filter((r) => r.remainingDays < 0).length;
  const totalCount = reportRows.length;

  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  return (
    <Layout>
      <div
        className="w-full mt-5 p-2 bg-background-table rounded-xl"
        data-cy="rentals-datagrid"
      >
        {error ? (
          <p className="text-red-600 py-4" data-cy="rentals-error">
            Fehler beim Laden der Daten: {error}
          </p>
        ) : reportDataAvailable ? (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <h2
                className={`text-base font-bold ${overdueCount > 0 ? "text-red-700" : "text-green-700"}`}
                data-cy="rentals-overdue-count"
              >
                {overdueCount > 0
                  ? `⚠ ${overdueCount} Buch${overdueCount !== 1 ? "er" : ""} überfällig`
                  : "✓ Keine überfälligen Bücher"}
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExcelExport}
                  data-cy="rentals-excel-export"
                  className="
                    inline-flex items-center gap-2 px-4 py-2
                    text-sm font-medium text-white
                    bg-primary rounded-lg
                    hover:bg-primary-dark transition-colors
                    cursor-pointer
                  "
                >
                  <Download size={16} />
                  Excel Export
                </button>
                <button
                  type="button"
                  onClick={handlePdfExport}
                  data-cy="rentals-pdf-export"
                  className="
                    inline-flex items-center gap-2 px-4 py-2
                    text-sm font-medium text-white
                    bg-secondary rounded-lg
                    hover:bg-secondary-dark transition-colors
                    cursor-pointer
                  "
                >
                  <FileText size={16} />
                  PDF Export
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className="border-b border-gray-200"
                    >
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="
                            px-3 py-2.5 text-left text-xs font-semibold
                            text-muted-foreground uppercase tracking-wider
                            bg-gray-50 cursor-pointer select-none
                            hover:bg-gray-100 transition-colors
                          "
                          style={{
                            width: header.getSize(),
                            minWidth: header.getSize(),
                          }}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span className="inline-flex items-center gap-1">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {{
                              asc: " ↑",
                              desc: " ↓",
                            }[header.column.getIsSorted() as string] ?? ""}
                          </span>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {table.getRowModel().rows.map((row) => {
                    const isOverdue = row.original.remainingDays < 0;
                    return (
                      <tr
                        key={row.id}
                        className={
                          isOverdue
                            ? "bg-red-50/60 hover:bg-red-50"
                            : "hover:bg-gray-50/60"
                        }
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-3 py-2 text-sm text-gray-700 truncate"
                            style={{
                              maxWidth: cell.column.getSize(),
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Zeilen pro Seite:</span>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  className="
                    border border-gray-200 rounded-md px-2 py-1 text-sm
                    bg-white focus:outline-none focus:ring-2 focus:ring-primary/20
                  "
                >
                  {[25, 50, 80].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span>
                  Seite {pageIndex + 1} von {pageCount}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => table.firstPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    «
                  </button>
                  <button
                    type="button"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                  <button
                    type="button"
                    onClick={() => table.lastPage()}
                    disabled={!table.getCanNextPage()}
                    className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    »
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p
            className="text-muted-foreground py-8 text-center"
            data-cy="rentals-no-data"
          >
            Keine Daten verfügbar
          </p>
        )}
      </div>
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
