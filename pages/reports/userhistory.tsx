import Layout from "@/components/layout/Layout";
import { prisma } from "@/entities/db";
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
import { ChevronLeft, Download, FileText, History, Search } from "lucide-react"; // History Icon importiert
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// =============================================================================
// Konfiguration & PDF Styles
// =============================================================================

const COLUMN_WIDTHS: Record<string, number> = {
  schoolGrade: 100,
  fullName: 225, borrowCount: 80,
  borrowedBooks: 450,
};

const pdfStyles = StyleSheet.create({
  page: { padding: 30, fontSize: 9, fontFamily: "Helvetica" },
  header: { marginBottom: 20, borderBottom: 2, borderBottomColor: "#1976d2", paddingBottom: 10 },
  title: { fontSize: 18, fontWeight: "bold", color: "#1976d2" },
  tableHeader: { flexDirection: "row", backgroundColor: "#f0f0f0", fontWeight: "bold", padding: 5, borderBottom: 1 },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#eee", paddingVertical: 5, paddingHorizontal: 5 },
  colGrade: { width: "10%" },
  colName: { width: "25%" },
  colCount: { width: "10%", textAlign: "center" },
  colBooks: { width: "55%" },
  bookEntry: { marginBottom: 2, fontSize: 8 },
  dateLabel: { color: "#1976d2", fontWeight: "bold" }
});

const HistoryPdfDocument = ({ data }: { data: any[] }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.title}>Ausleih-Historie Bericht</Text>
        <Text style={{ fontSize: 10, color: "#666", marginTop: 4 }}>
          Erstellt am {new Date().toLocaleDateString("de-DE")} • {data.length} Nutzer
        </Text>
      </View>

      {/* Tabellen-Header */}
      <View style={pdfStyles.tableHeader}>
        <Text style={pdfStyles.colGrade}>Klasse</Text>
        <Text style={pdfStyles.colName}>Name</Text>
        <Text style={pdfStyles.colCount}>Gesamt</Text>
        <Text style={pdfStyles.colBooks}>Bücher (Datum | ID | Titel)</Text>
      </View>

      {/* Tabellen-Daten */}
      {data.map((row, index) => (
        <View key={index} style={pdfStyles.tableRow} wrap={false}>
          <Text style={pdfStyles.colGrade}>{row.schoolGrade}</Text>
          {/* Hier die korrekte Kombination von Last/First Name */}
          <Text style={pdfStyles.colName}>{`${row.lastName}, ${row.firstName}`}</Text>
          <Text style={pdfStyles.colCount}>{row.borrowCount}</Text>
          <View style={pdfStyles.colBooks}>
            {row.borrowedBooks.map((b: any, bi: number) => (
              <Text key={bi} style={pdfStyles.bookEntry}>
                <Text style={pdfStyles.dateLabel}>{b.loanDate} | ID: {b.bookId}: </Text>
                <Text>{b.title}</Text>
              </Text>
            ))}
          </View>
        </View>
      ))}
    </Page>
  </Document>
);

export default function Users({ history }: { history: any[] }) {
  const [reportRows, setReportRows] = useState<any[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    if (history) setReportRows(history);
  }, [history]);

  const allGrades = useMemo(() => {
    const grades = new Set(history.map((h) => h.schoolGrade).filter(Boolean));
    return Array.from(grades).sort();
  }, [history]);

  const headerClass = "uppercase text-[14px] font-semibold text-muted-foreground tracking-wider mb-1";

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: "schoolGrade",
      size: COLUMN_WIDTHS.schoolGrade,
      header: ({ column }) => (
        <div className="flex flex-col gap-1.5 py-1">
          <span className={headerClass}>Klasse</span>
          <select
            value={(column.getFilterValue() as string) ?? ""}
            onChange={(e) => column.setFilterValue(e.target.value || undefined)}
            className="font-normal text-xs border border-gray-300 rounded px-1 py-1 bg-white outline-none focus:ring-1 focus:ring-primary text-black w-20"
          >
            <option value="">Alle</option>
            {allGrades.map((grade: any) => <option key={grade} value={grade}>{grade}</option>)}
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
          {/* Schriftgröße auf 10px korrigiert */}
          <span className="uppercase text-[14px] font-semibold text-muted-foreground tracking-wider mb-1">
            Name (Suche)
          </span>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
            <input
              type="text"
              value={(column.getFilterValue() as string) ?? ""}
              onChange={(e) => column.setFilterValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  column.setFilterValue("");
                  // Optional: Fokus behalten/erzwingen
                  (e.target as HTMLInputElement).blur();
                  (e.target as HTMLInputElement).focus();
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
          <div className="h-6.5" />
        </div>
      ),
      cell: ({ getValue }) => <div className="text-center font-medium">{getValue() as number}</div>,
    },
    {
      accessorKey: "borrowedBooks",
      size: COLUMN_WIDTHS.borrowedBooks,
      header: () => (
        <div className="flex flex-col gap-1.5 py-1">
          <span className={headerClass}>Ausleih-Historie</span>
          <div className="h-6.5" />
        </div>
      ),
      cell: ({ row }) => {
        const books = row.original.borrowedBooks;
        if (!Array.isArray(books) || books.length === 0) return <span className="text-gray-300">-</span>;
        return (
          <div className="flex flex-col gap-1.5 py-1">
            {books.map((b: any, i: number) => (
              <div key={i} className="text-[11px] flex items-center gap-2 border-b border-gray-50 last:border-0 pb-1">
                <span className="font-mono text-blue-600 bg-blue-50 px-1 rounded whitespace-nowrap">{b.loanDate}</span>
                <span className="font-mono text-amber-700 bg-amber-50 px-1 rounded whitespace-nowrap">#{b.bookId}</span>
                <span className="text-gray-700 leading-tight truncate">{b.title}</span>
              </div>
            ))}
          </div>
        );
      },
    },
  ], [allGrades]);

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
    initialState: { pagination: { pageSize: 100 } },
  });

  const handleExcelExport = async () => {
    const data = table.getFilteredRowModel().rows.map(r => r.original);
    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet("Historie");
    sheet.columns = [
      { header: "Klasse", key: "schoolGrade", width: 10 },
      { header: "Name", key: "fullName", width: 30 },
      { header: "Anzahl", key: "borrowCount", width: 10 },
      { header: "Bücher", key: "books", width: 70 }
    ];
    data.forEach(item => {
      sheet.addRow({
        schoolGrade: item.schoolGrade,
        fullName: `${item.lastName}, ${item.firstName}`,
        borrowCount: item.borrowCount,
        books: item.borrowedBooks.map((b: any) => `${b.loanDate} [ID:${b.bookId}]: ${b.title}`).join("\n")
      }).getCell('books').alignment = { wrapText: true, vertical: 'top' };
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([buffer]));
    link.download = `historie_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
  };

  const handlePdfExport = async () => {
    const data = table.getFilteredRowModel().rows.map(r => r.original);
    const blob = await pdf(<HistoryPdfDocument data={data} />).toBlob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `historie_${new Date().toISOString().split('T')[0]}.pdf`;
    link.click();
  };

  return (
    <Layout>

      <div className="w-full mt-5 p-2 bg-background-table rounded-xl">

        <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/reports"
              className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors text-sm font-medium group"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
              Zurück
            </Link>

            <div className="h-6 w-px bg-gray-300 mx-1" /> {/* Vertikaler Strich */}

            <h2 className="text-lg font-bold text-primary flex items-center gap-2.5">
              <History size={20} className="text-blue-600" />
              Verlauf der Leihen <i>({table.getFilteredRowModel().rows.length} Nutzer werden angezeigt)</i>
            </h2>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePdfExport} className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg text-sm hover:opacity-90 shadow-sm transition-all">
              <FileText size={16} /> PDF Export
            </button>
            <button onClick={handleExcelExport} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:opacity-90 shadow-sm transition-all">
              <Download size={16} /> Excel Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm border-collapse table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left overflow-hidden align-top"
                      style={{ width: header.column.columnDef.size }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="bg-white hover:bg-blue-50/30 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-2 align-top text-gray-700 overflow-hidden wrap-break-word">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    const [users, audits, books] = await Promise.all([
      prisma.user.findMany({ orderBy: { lastName: 'asc' } }),
      prisma.audit.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.book.findMany({ select: { id: true, title: true } })
    ]);
    const bookMap = new Map(books.map(b => [b.id, b.title]));
    const history = users.map(user => {
      const borrowedBooks = audits
        .filter(a => a.userid === user.id && a.eventType.toLowerCase() === 'rent book')
        .map(rent => ({
          loanDate: convertDateToDayString(rent.createdAt),
          rawDate: rent.createdAt.toISOString(),
          bookId: rent.bookid || "?",
          title: bookMap.get(rent.bookid!) || `Unbekanntes Buch`
        }))
        .sort((a, b) => b.rawDate.localeCompare(a.rawDate));
      return {
        schoolGrade: user.schoolGrade || "-",
        lastName: user.lastName,
        firstName: user.firstName,
        borrowedBooks,
        borrowCount: borrowedBooks.length
      };
    });
    return { props: { history: JSON.parse(JSON.stringify(history)) } };
  } catch (e) { return { props: { history: [] } }; }
}
