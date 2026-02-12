import Layout from "@/components/layout/Layout";
import { BookType } from "@/entities/BookType";
import { getAllBooks } from "@/entities/book";
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
import Excel from "exceljs";
import { Download, FileText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// =============================================================================
// Column width config
// =============================================================================

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
// PDF Styles (unchanged)
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
// PDF Document Component (unchanged)
// =============================================================================

interface BooksPdfProps {
  rentedBooks: BookType[];
  availableBooks: BookType[];
  columns: { field: string; headerName: string }[];
}

const BooksPdfDocument = ({
  rentedBooks,
  availableBooks,
  columns,
}: BooksPdfProps) => {
  const today = new Date().toLocaleDateString("de-DE");

  const getColumnHeader = (field: string) => {
    const col = columns.find((c) => c.field === field);
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

        <Text style={pdfStyles.footer}>
          OpenLibry • Bestandsbericht vom {today}
        </Text>
      </Page>
    </Document>
  );
};

// =============================================================================
// Excel & PDF export functions (unchanged)
// =============================================================================

async function exportToPdf(
  columns: { field: string; headerName: string }[],
  rows: BookType[],
) {
  const rentedBooks = rows
    .filter((r) => r.rentalStatus === "rented")
    .sort((a, b) => (a.title || "").localeCompare(b.title || "", "de"));

  const availableBooks = rows
    .filter((r) => r.rentalStatus !== "rented")
    .sort((a, b) => (a.title || "").localeCompare(b.title || "", "de"));

  const blob = await pdf(
    <BooksPdfDocument
      rentedBooks={rentedBooks}
      availableBooks={availableBooks}
      columns={columns}
    />,
  ).toBlob();

  const today = new Date().toISOString().split("T")[0];
  const filename = `bestand_${today}.pdf`;

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

  const sheet = workbook.addWorksheet("Bücher");

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
  const filename = `bestand_${today}.xlsx`;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// =============================================================================
// Page component
// =============================================================================

interface BookPropsType {
  books: Array<BookType>;
}

export default function Books({ books }: BookPropsType) {
  const [reportColumns, setReportColumns] = useState<
    { field: string; headerName: string; width: number }[]
  >([]);
  const [reportRows, setReportRows] = useState<any[]>([]);
  const [reportDataAvailable, setReportDataAvailable] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    setReportDataAvailable(books.length > 0);
    if (books && books.length > 0) {
      const colTitles = books[0];
      const fields = Object.keys(colTitles);
      const cols = fields.map((f) => {
        const fieldTranslation = (translations as any)["books"][f];
        return {
          field: f,
          headerName: fieldTranslation,
          width: getWidth(f),
        };
      });

      const rows = books.map((r: any) => ({
        id: r.id,
        ...r,
      }));

      setReportColumns(cols);
      setReportRows(rows);
    }
  }, [books]);

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

  const rentedCount = reportRows.filter(
    (r: any) => r.rentalStatus === "rented",
  ).length;
  const totalCount = reportRows.length;

  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  return (
    <Layout>
      <div
        className="w-full mt-5 p-2 bg-background-table rounded-xl"
        data-cy="books-datagrid"
      >
        {reportDataAvailable ? (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <h2
                className="text-base font-bold text-primary"
                data-cy="books-status"
              >
                📚 {totalCount} Bücher • {rentedCount} ausgeliehen •{" "}
                {totalCount - rentedCount} verfügbar
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExcelExport}
                  data-cy="books-excel-export"
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
                  data-cy="books-pdf-export"
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
                    const isRented = row.original.rentalStatus === "rented";
                    return (
                      <tr
                        key={row.id}
                        className={
                          isRented
                            ? "bg-orange-50/60 hover:bg-orange-50"
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
            data-cy="books-no-data"
          >
            Keine Daten verfügbar
          </p>
        )}
      </div>
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
