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
import {
  ChevronDown,
  ChevronLeft,
  ChevronsUpDown,
  ChevronUp,
  Download,
  FileText,
  History,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

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
// Constants
// =============================================================================

const COLUMN_WIDTHS = {
  schoolGrade: 100,
  fullName: 225,
  borrowCount: 80,
  borrowedBooks: 450,
} as const;

/** Max books shown per PDF row to prevent single-row page overflow */
const PDF_MAX_BOOKS_PER_ROW = 20;

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
  overflow: { color: "#888", fontSize: 8, fontStyle: "italic", marginTop: 2 },
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

        {/* Table Rows — wrap allowed so tall rows can break across pages */}
        {data.length > 0 ? (
          data.map((row, index) => {
            const visibleBooks = row.borrowedBooks.slice(
              0,
              PDF_MAX_BOOKS_PER_ROW,
            );
            const overflowCount =
              row.borrowedBooks.length - visibleBooks.length;

            return (
              <View key={index} style={pdfStyles.tableRow}>
                <Text style={pdfStyles.colGrade}>{row.schoolGrade}</Text>
                <Text style={pdfStyles.colName}>
                  {`${row.lastName}, ${row.firstName}`}
                </Text>
                <Text style={pdfStyles.colCount}>{row.borrowCount}</Text>
                <View style={pdfStyles.colBooks}>
                  {visibleBooks.map((b, bi) => (
                    <Text key={bi} style={pdfStyles.bookEntry}>
                      <Text style={pdfStyles.dateLabel}>
                        {b.loanDate} | ID: {b.bookId}:{" "}
                      </Text>
                      {/* NFC normalization required: DNB titles arrive NFD-decomposed,
                          which @react-pdf/renderer cannot render correctly */}
                      <Text>{b.title.normalize("NFC")}</Text>
                    </Text>
                  ))}
                  {overflowCount > 0 && (
                    <Text style={pdfStyles.overflow}>
                      … und {overflowCount} weitere
                    </Text>
                  )}
                </View>
              </View>
            );
          })
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
  headerRow.eachCell((cell: Excel.Cell) => {
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
// Shared sub-components
// =============================================================================

interface ExportButtonProps {
  onClick: () => void;
  dataCy: string;
  icon: ReactNode;
  label: string;
  variant?: "primary" | "secondary";
}

function ExportButton({
  onClick,
  dataCy,
  icon,
  label,
  variant = "primary",
}: ExportButtonProps) {
  const colorClass =
    variant === "primary"
      ? "bg-primary hover:bg-primary-dark"
      : "bg-secondary hover:bg-secondary-dark";

  return (
    <button
      type="button"
      onClick={onClick}
      data-cy={dataCy}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white ${colorClass} rounded-lg transition-colors cursor-pointer`}
    >
      {icon}
      {label}
    </button>
  );
}

function SortIcon({ direction }: { direction: "asc" | "desc" | false }) {
  if (direction === "asc") return <ChevronUp size={14} />;
  if (direction === "desc") return <ChevronDown size={14} />;
  return <ChevronsUpDown size={14} className="text-muted-foreground/50" />;
}

// =============================================================================
// Mobile card component
// =============================================================================

function MobileHistoryCard({
  row,
  isExpanded,
  onToggle,
}: {
  row: HistoryRow;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      data-cy="history-mobile-card"
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 shrink-0">
            {row.schoolGrade}
          </span>
          <span className="font-medium text-gray-800 truncate">
            {row.lastName}, {row.firstName}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {row.borrowCount} Bücher
          </span>
          {isExpanded ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="border-t border-gray-100 px-4 py-3 flex flex-col gap-2">
          {row.borrowedBooks.length === 0 ? (
            <span className="text-sm text-gray-400">Keine Ausleihen</span>
          ) : (
            row.borrowedBooks.map((b, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 pb-2 border-b border-gray-50 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    {b.loanDate}
                  </span>
                  <span className="font-mono text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                    #{b.bookId}
                  </span>
                </div>
                <span className="text-sm text-gray-700 leading-snug">
                  {b.title}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Page component
// =============================================================================

export default function UserHistory({ history, error }: HistoryPropsType) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [activeOnly, setActiveOnly] = useState(true);
  const [exportError, setExportError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Derive table data directly from the SSR prop — no useState/useEffect mirror needed
  const tableData = useMemo(
    () =>
      activeOnly
        ? (history ?? []).filter((r) => r.borrowCount > 0)
        : (history ?? []),
    [history, activeOnly],
  );

  const allGrades = useMemo(() => {
    const grades = new Set(
      (history ?? [])
        .map((h) => h.schoolGrade)
        .filter((g): g is string => Boolean(g)),
    );
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
              data-cy="history-grade-filter"
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
                data-cy="history-name-filter"
                className="w-full font-normal text-xs border border-gray-200 rounded pl-7 pr-2 py-1 bg-white outline-none focus:ring-1 focus:ring-primary text-black"
              />
            </div>
          </div>
        ),
      },
      {
        accessorKey: "borrowCount",
        size: COLUMN_WIDTHS.borrowCount,
        header: ({ column }) => (
          <div className="flex flex-col gap-1.5 py-1 items-center">
            <button
              type="button"
              onClick={column.getToggleSortingHandler()}
              className="flex items-center gap-1 cursor-pointer select-none group"
            >
              <span className={headerClass}>Gesamt</span>
              <SortIcon direction={column.getIsSorted()} />
            </button>
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
        enableSorting: false,
        enableColumnFilter: false,
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
                  <span className="text-gray-700 leading-tight break-words min-w-0">
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
    data: tableData,
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
      errorLogger.error(
        { event: LogEvents.EXPORT_ERROR, error: String(err) },
        "PDF export failed",
      );
      setExportError("PDF-Export fehlgeschlagen. Bitte erneut versuchen.");
    }
  };

  const handleExcelExport = async () => {
    setExportError(null);
    try {
      const data = table.getFilteredRowModel().rows.map((r) => r.original);
      await exportToExcel(data);
    } catch (err) {
      errorLogger.error(
        { event: LogEvents.EXPORT_ERROR, error: String(err) },
        "Excel export failed",
      );
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
        ) : tableData.length > 0 || history?.length > 0 ? (
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

              <div className="flex flex-wrap items-center gap-3">
                {/* Active-only toggle */}
                <label
                  className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none"
                  data-cy="history-active-only-label"
                >
                  <input
                    type="checkbox"
                    checked={activeOnly}
                    onChange={(e) => setActiveOnly(e.target.checked)}
                    data-cy="history-active-only"
                    className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  Nur aktive Nutzer
                </label>

                <div className="h-5 w-px bg-gray-300" />

                <ExportButton
                  onClick={handleExcelExport}
                  dataCy="history-excel-export"
                  icon={<Download size={16} />}
                  label="Excel Export"
                  variant="primary"
                />
                <ExportButton
                  onClick={handlePdfExport}
                  dataCy="history-pdf-export"
                  icon={<FileText size={16} />}
                  label="PDF Export"
                  variant="secondary"
                />
              </div>
            </div>

            {/* Export feedback */}
            {exportError && (
              <p
                className="text-red-600 text-sm mb-2"
                data-cy="history-export-error"
              >
                {exportError}
              </p>
            )}

            {/* Export scope hint */}
            <p
              className="text-xs text-muted-foreground mb-2"
              data-cy="history-export-hint"
            >
              Export umfasst die aktuelle gefilterte Ansicht ({filteredCount}{" "}
              Nutzer).
            </p>

            {/* Mobile filter bar — hidden on md+ */}
            <div className="md:hidden flex flex-col gap-2 mb-3">
              <div className="relative">
                <Search
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={14}
                />
                <input
                  type="text"
                  value={
                    (table.getColumn("fullName")?.getFilterValue() as string) ??
                    ""
                  }
                  onChange={(e) =>
                    table.getColumn("fullName")?.setFilterValue(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Escape")
                      table.getColumn("fullName")?.setFilterValue("");
                  }}
                  placeholder="Name suchen…"
                  data-cy="history-mobile-name-filter"
                  className="w-full text-sm border border-gray-200 rounded-lg pl-8 pr-3 py-2 bg-white outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <select
                value={
                  (table
                    .getColumn("schoolGrade")
                    ?.getFilterValue() as string) ?? ""
                }
                onChange={(e) =>
                  table
                    .getColumn("schoolGrade")
                    ?.setFilterValue(e.target.value || undefined)
                }
                data-cy="history-mobile-grade-filter"
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Alle Klassen</option>
                {allGrades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop table — hidden on small screens */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-lg border border-gray-200">
              <table
                className="w-full text-sm border-collapse table-fixed min-w-[855px]"
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

            {/* Mobile card list — hidden on md+ */}
            <div
              className="md:hidden flex flex-col gap-2"
              data-cy="history-mobile-list"
            >
              {table.getRowModel().rows.length > 0 ? (
                table
                  .getRowModel()
                  .rows.map((row) => (
                    <MobileHistoryCard
                      key={row.id}
                      row={row.original}
                      isExpanded={expandedCards.has(row.id)}
                      onToggle={() => toggleCard(row.id)}
                    />
                  ))
              ) : (
                <p
                  className="text-center py-8 text-muted-foreground"
                  data-cy="history-no-results"
                >
                  Keine Ergebnisse für diesen Filter
                </p>
              )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Zeilen pro Seite:</span>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  data-cy="history-page-size"
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
                    data-cy="history-page-first"
                    className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    «
                  </button>
                  <button
                    type="button"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    data-cy="history-page-prev"
                    className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    data-cy="history-page-next"
                    className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                  <button
                    type="button"
                    onClick={() => table.lastPage()}
                    disabled={!table.getCanNextPage()}
                    data-cy="history-page-last"
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
