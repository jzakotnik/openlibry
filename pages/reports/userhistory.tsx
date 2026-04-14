import Layout from "@/components/layout/Layout";
import { getRentEventsByUser } from "@/entities/audit";
import { getAllBooks } from "@/entities/book";
import { prisma } from "@/entities/db";
import { getAllUsers } from "@/entities/user";
import { LogEvents } from "@/lib/logEvents";
import { errorLogger } from "@/lib/logger";
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
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import Excel from "exceljs";
import { ChevronLeft, Download, FileText, History, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// =============================================================================
// Types
// =============================================================================

interface BorrowedBook {
  loanDate: string;
  rawDate: string;
  bookId: number | string;
  title: string;
}

interface HistoryRow {
  schoolGrade: string;
  lastName: string;
  firstName: string;
  borrowedBooks: BorrowedBook[];
  borrowCount: number;
}

interface HistoryPropsType {
  history: HistoryRow[];
  error?: string;
}

// =============================================================================
// Column width config
// =============================================================================

const COLUMN_WIDTHS: Record<string, number> = {
  schoolGrade: 100,
  fullName: 225,
  borrowCount: 80,
  borrowedBooks: 450,
};

// =============================================================================
// PDF Styles
// =============================================================================

const pdfStyles = StyleSheet.create({
  page: { padding: 30, fontSize: 9, fontFamily: "Helvetica" },
  header: {
    marginBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: "#1976d2",
    paddingBottom: 12,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#1976d2" },
  subtitle: { fontSize: 10, color: "#666", marginTop: 6 },
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
  colGrade: { width: "10%" },
  colName: { width: "22%", paddingRight: 4 },
  colCount: { width: "8%", textAlign: "center" },
  colBooks: { width: "60%" },
  headerText: { color: "#fff", fontWeight: "bold" },
  bookEntry: { marginBottom: 3, fontSize: 8 },
  dateLabel: { color: "#1976d2", fontWeight: "bold" },
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

interface HistoryPdfProps {
  data: HistoryRow[];
}

const HistoryPdfDocument = ({ data }: HistoryPdfProps) => {
  const today = new Date().toLocaleDateString("de-DE");

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>Ausleih-Historie Bericht</Text>
          <Text style={pdfStyles.subtitle}>
            Erstellt am {today} • {data.length} Nutzer
          </Text>
        </View>

        {/* Table Header */}
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.colGrade, pdfStyles.headerText]}>Klasse</Text>
          <Text style={[pdfStyles.colName, pdfStyles.headerText]}>Name</Text>
          <Text style={[pdfStyles.colCount, pdfStyles.headerText]}>Gesamt</Text>
          <Text style={[pdfStyles.colBooks, pdfStyles.headerText]}>
            Bücher (Datum | ID | Titel)
          </Text>
        </View>

        {/* Table Rows */}
        {data.length > 0 ? (
          data.map((row, index) => (
            <View key={index} style={pdfStyles.tableRow} wrap={false}>
              <Text style={pdfStyles.colGrade}>{row.schoolGrade}</Text>
              <Text style={pdfStyles.colName}>
                {`${row.lastName}, ${row.firstName}`}
              </Text>
              <Text style={pdfStyles.colCount}>{row.borrowCount}</Text>
              <View style={pdfStyles.colBooks}>
                {row.borrowedBooks.map((b, bi) => (
                  <Text key={bi} style={pdfStyles.bookEntry}>
                    <Text style={pdfStyles.dateLabel}>
                      {b.loanDate} | ID: {b.bookId}:{" "}
                    </Text>
                    {/* NFC normalization required: DNB titles arrive NFD-decomposed,
                        which @react-pdf/renderer cannot render correctly */}
                    <Text>{b.title.normalize("NFC")}</Text>
                  </Text>
                ))}
              </View>
            </View>
          ))
        ) : (
          <Text style={pdfStyles.emptyMessage}>Keine Daten vorhanden</Text>
        )}

        {/* Footer */}
        <Text style={pdfStyles.footer}>
          OpenLibry • Verlauf der Leihen vom {today}
        </Text>
      </Page>
    </Document>
  );
};

// =============================================================================
// Export functions
// =============================================================================

async function exportToPdf(data: HistoryRow[]): Promise<void> {
  const blob = await pdf(<HistoryPdfDocument data={data} />).toBlob();
  const today = new Date().toISOString().split("T")[0];
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `historie_${today}.pdf`;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function exportToExcel(data: HistoryRow[]): Promise<void> {
  const workbook = new Excel.Workbook();
  workbook.creator = "OpenLibry";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Historie");

  sheet.columns = [
    { header: "Klasse", key: "schoolGrade", width: 10 },
    { header: "Name", key: "fullName", width: 30 },
    { header: "Anzahl", key: "borrowCount", width: 10 },
    { header: "Bücher", key: "books", width: 70 },
  ];

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

  data.forEach((item) => {
    const row = sheet.addRow({
      schoolGrade: item.schoolGrade,
      fullName: `${item.lastName}, ${item.firstName}`,
      borrowCount: item.borrowCount,
      books: item.borrowedBooks
        .map((b) => `${b.loanDate} [ID:${b.bookId}]: ${b.title}`)
        .join("\n"),
    });
    row.getCell("books").alignment = { wrapText: true, vertical: "top" };
  });

  sheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  const today = new Date().toISOString().split("T")[0];
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
  link.download = `historie_${today}.xlsx`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// =============================================================================
// Page component
// =============================================================================

export default function UserHistory({ history, error }: HistoryPropsType) {
  const [reportRows, setReportRows] = useState<HistoryRow[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    if (history) setReportRows(history);
  }, [history]);

  const allGrades = useMemo(() => {
    const grades = new Set(history?.map((h) => h.schoolGrade).filter(Boolean));
    return Array.from(grades).sort();
  }, [history]);

  const headerClass =
    "uppercase text-xs font-semibold text-muted-foreground tracking-wider mb-1";

  const columns = useMemo<ColumnDef<HistoryRow>[]>(
    () => [
      {
        accessorKey: "schoolGrade",
        size: COLUMN_WIDTHS.schoolGrade,
        header: ({ column }) => (
          <div className="flex flex-col gap-1.5 py-1">
            <span className={headerClass}>Klasse</span>
            <select
              value={(column.getFilterValue() as string) ?? ""}
              onChange={(e) =>
                column.setFilterValue(e.target.value || undefined)
              }
              className="font-normal text-xs border border-gray-300 rounded px-1 py-1 bg-white outline-none focus:ring-1 focus:ring-primary text-black w-20"
            >
              <option value="">Alle</option>
              {allGrades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
        ),
      },
      {
        id: "fullName",
        accessorFn: (row) => `${row.lastName}, ${row.firstName}`,
        size: COLUMN_WIDTHS.fullName,
        header: ({ column }) => (
          <div className="flex flex-col gap-1.5 py-1">
            <span className={headerClass}>Name (Suche)</span>
            <div className="relative">
              <Search
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                size={12}
              />
              <input
                type="text"
                value={(column.getFilterValue() as string) ?? ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    column.setFilterValue("");
                  }
                }}
                placeholder="Name tippen..."
                className="w-full font-normal text-xs border border-gray-200 rounded pl-7 pr-2 py-1 bg-white outline-none focus:ring-1 focus:ring-primary text-black"
              />
            </div>
          </div>
        ),
      },
      {
        accessorKey: "borrowCount",
        size: COLUMN_WIDTHS.borrowCount,
        header: () => (
          <div className="flex flex-col gap-1.5 py-1 items-center">
            <span className={headerClass}>Gesamt</span>
            <div className="h-6" />
          </div>
        ),
        cell: ({ getValue }) => (
          <div className="text-center font-medium">{getValue() as number}</div>
        ),
      },
      {
        accessorKey: "borrowedBooks",
        size: COLUMN_WIDTHS.borrowedBooks,
        header: () => (
          <div className="flex flex-col gap-1.5 py-1">
            <span className={headerClass}>Ausleih-Historie</span>
            <div className="h-6" />
          </div>
        ),
        cell: ({ row }) => {
          const books = row.original.borrowedBooks;
          if (!Array.isArray(books) || books.length === 0)
            return <span className="text-gray-300">–</span>;
          return (
            <div className="flex flex-col gap-1.5 py-1">
              {books.map((b, i) => (
                <div
                  key={i}
                  className="text-[11px] flex items-center gap-2 border-b border-gray-50 last:border-0 pb-1"
                >
                  <span className="font-mono text-blue-600 bg-blue-50 px-1 rounded whitespace-nowrap">
                    {b.loanDate}
                  </span>
                  <span className="font-mono text-amber-700 bg-amber-50 px-1 rounded whitespace-nowrap">
                    #{b.bookId}
                  </span>
                  <span className="text-gray-700 leading-tight truncate">
                    {b.title}
                  </span>
                </div>
              ))}
            </div>
          );
        },
      },
    ],
    [allGrades],
  );

  const table = useReactTable({
    data: reportRows,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  const handlePdfExport = async () => {
    setExportError(null);
    try {
      const data = table.getFilteredRowModel().rows.map((r) => r.original);
      await exportToPdf(data);
    } catch (err) {
      console.error("PDF export failed:", err);
      setExportError("PDF-Export fehlgeschlagen. Bitte erneut versuchen.");
    }
  };

  const handleExcelExport = async () => {
    setExportError(null);
    try {
      const data = table.getFilteredRowModel().rows.map((r) => r.original);
      await exportToExcel(data);
    } catch (err) {
      console.error("Excel export failed:", err);
      setExportError("Excel-Export fehlgeschlagen. Bitte erneut versuchen.");
    }
  };

  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <Layout>
      <div
        className="w-full mt-5 p-2 bg-background-table rounded-xl"
        data-cy="history-datagrid"
      >
        {error ? (
          <p className="text-red-600 py-4" data-cy="history-error">
            Fehler beim Laden der Daten: {error}
          </p>
        ) : reportRows.length > 0 ? (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <Link
                  href="/reports"
                  className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors text-sm font-medium group"
                >
                  <ChevronLeft
                    size={20}
                    className="group-hover:-translate-x-0.5 transition-transform"
                  />
                  Zurück
                </Link>
                <div className="h-6 w-px bg-gray-300" />
                <h2
                  className="text-base font-bold text-primary flex items-center gap-2"
                  data-cy="history-title"
                >
                  <History size={18} className="text-blue-600" />
                  Verlauf der Leihen{" "}
                  <span className="font-normal text-muted-foreground text-sm">
                    ({filteredCount} Nutzer)
                  </span>
                </h2>
              </div>

              <div className="flex gap-2">
                {" "}
                <button
                  type="button"
                  onClick={handleExcelExport}
                  data-cy="history-excel-export"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
                >
                  <Download size={16} />
                  Excel Export
                </button>
                <button
                  type="button"
                  onClick={handlePdfExport}
                  data-cy="history-pdf-export"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary-dark transition-colors cursor-pointer"
                >
                  <FileText size={16} />
                  PDF Export
                </button>
              </div>
            </div>

            {/* Export error feedback */}
            {exportError && (
              <p
                className="text-red-600 text-sm mb-2"
                data-cy="history-export-error"
              >
                {exportError}
              </p>
            )}

            {/* Table */}
            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
              <table
                className="w-full text-sm border-collapse table-fixed"
                data-cy="history-table"
              >
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id} className="border-b border-gray-200">
                      {hg.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground bg-gray-50 overflow-hidden align-top"
                          style={{ width: header.column.columnDef.size }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="bg-white hover:bg-blue-50/30 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-3 py-2 align-top text-sm text-gray-700 overflow-hidden"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="text-center py-8 text-muted-foreground"
                        data-cy="history-no-results"
                      >
                        Keine Ergebnisse für diesen Filter
                      </td>
                    </tr>
                  )}
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
                  className="border border-gray-200 rounded-md px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {[25, 50, 100].map((size) => (
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
            data-cy="history-no-data"
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
    const [users, rentEvents, books] = await Promise.all([
      getAllUsers(prisma),
      getRentEventsByUser(prisma),
      getAllBooks(prisma),
    ]);

    const bookMap = new Map(books.map((b) => [b.id, b.title]));

    const history: HistoryRow[] = users.map((user) => {
      const borrowedBooks: BorrowedBook[] = rentEvents
        .filter((a) => a.userid === user.id)
        .map((rent) => ({
          loanDate: convertDateToDayString(rent.createdAt),
          rawDate: rent.createdAt.toISOString(),
          bookId: rent.bookid ?? "?",
          title: bookMap.get(rent.bookid!) ?? "Unbekanntes Buch",
        }))
        .sort((a, b) => b.rawDate.localeCompare(a.rawDate));

      return {
        schoolGrade: user.schoolGrade ?? "-",
        lastName: user.lastName,
        firstName: user.firstName,
        borrowedBooks,
        borrowCount: borrowedBooks.length,
      };
    });

    return { props: { history: JSON.parse(JSON.stringify(history)) } };
  } catch (error) {
    errorLogger.error(
      { event: LogEvents.DB_ERROR, error: String(error) },
      "Error fetching user history",
    );
    return {
      props: {
        history: [],
        error: "Fehler beim Laden der Ausleih-Historie",
      },
    };
  }
}
