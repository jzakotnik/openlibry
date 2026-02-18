import Layout from "@/components/layout/Layout";
import * as ExcelJS from "exceljs";
import {
  AlertTriangle,
  Book,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Database,
  FileSpreadsheet,
  Loader2,
  RotateCcw,
  Trash2,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import Head from "next/head";
import React, { useCallback, useMemo, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const parseId = (value: any): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? undefined : parsed;
};

const parseIntOrDefault = (value: any, defaultValue: number = 0): number => {
  if (value === undefined || value === null || value === "")
    return defaultValue;
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

const normalizeBookData = (data: any[]): any[] => {
  if (data.length <= 1) return data;
  const [headers, ...rows] = data;
  const normalizedRows = rows.map((row: any) => ({
    ...row,
    Mediennummer: parseId(row["Mediennummer"]),
    "Anzahl Verlängerungen": parseIntOrDefault(row["Anzahl Verlängerungen"], 0),
  }));
  return [headers, ...normalizedRows];
};

const normalizeUserData = (data: any[]): any[] => {
  if (data.length <= 1) return data;
  const [headers, ...rows] = data;
  const normalizedRows = rows.map((row: any) => ({
    ...row,
    Nummer: parseId(row["Nummer"]),
  }));
  return [headers, ...normalizedRows];
};

// ─────────────────────────────────────────────────────────────────────────────
// Log entry type for structured logging
// ─────────────────────────────────────────────────────────────────────────────

type LogLevel = "info" | "success" | "warning" | "error" | "separator";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp?: Date;
}

function createLog(
  level: LogLevel,
  message: string,
  withTimestamp = false,
): LogEntry {
  return {
    level,
    message,
    timestamp: withTimestamp ? new Date() : undefined,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StepIndicator({
  step,
  currentStep,
  label,
}: {
  step: number;
  currentStep: number;
  label: string;
}) {
  const isActive = currentStep >= step;
  const isCurrent = currentStep === step;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
          isActive ? "bg-[#12556F] text-white" : "bg-gray-200 text-gray-400"
        } ${isCurrent ? "ring-2 ring-[#12556F]/30 ring-offset-1" : ""}`}
      >
        {isActive && currentStep > step ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          step
        )}
      </div>
      <span
        className={`text-sm font-medium ${isActive ? "text-gray-900" : "text-gray-400"}`}
      >
        {label}
      </span>
    </div>
  );
}

function StepConnector({ active }: { active: boolean }) {
  return (
    <div
      className={`hidden sm:block w-8 h-px mx-1 transition-colors ${active ? "bg-[#12556F]" : "bg-gray-200"}`}
    />
  );
}

function DataSummaryCard({
  icon: Icon,
  label,
  count,
  columns,
  color,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  columns: number;
  color: string;
}) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl border bg-white"
      style={{ borderLeftWidth: 4, borderLeftColor: color }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900">
          {count.toLocaleString("de-DE")}
        </p>
        <p className="text-xs text-gray-500">
          {label} · {columns} Spalten
        </p>
      </div>
    </div>
  );
}

function LogLine({ entry }: { entry: LogEntry }) {
  if (entry.level === "separator") {
    return <div className="h-px bg-gray-200 my-1.5" />;
  }

  const config = {
    info: { icon: null, color: "text-gray-600" },
    success: { icon: CheckCircle, color: "text-emerald-600" },
    warning: { icon: AlertTriangle, color: "text-amber-600" },
    error: { icon: XCircle, color: "text-red-600" },
  }[entry.level];

  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-1.5 py-0.5 ${config.color}`}>
      {Icon && <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
      <span className="font-mono text-xs leading-relaxed">
        {entry.timestamp && (
          <span className="text-gray-400 mr-2">
            {entry.timestamp.toLocaleTimeString("de-DE")}
          </span>
        )}
        {entry.message}
      </span>
    </div>
  );
}

const DataPreviewTable = React.memo(
  ({ data, maxRows = 8 }: { data: any[]; maxRows?: number }) => {
    const [expanded, setExpanded] = useState(false);

    if (!data || data.length <= 1) return null;

    const headers = data[0] as string[];
    const visibleHeaders = headers.filter(Boolean);
    const rows = data.slice(1);
    const displayRows = expanded ? rows.slice(0, 50) : rows.slice(0, maxRows);
    const hasMore = rows.length > maxRows;

    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {visibleHeaders.map((header, i) => (
                  <th
                    key={i}
                    className="px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  {visibleHeaders.map((header, i) => (
                    <td
                      key={i}
                      className="px-3 py-1.5 text-gray-700 whitespace-nowrap max-w-[200px] truncate"
                    >
                      {row[header] != null ? String(row[header]) : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                Weniger anzeigen
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                {rows.length - maxRows} weitere Zeilen
              </>
            )}
          </button>
        )}
      </div>
    );
  },
);
DataPreviewTable.displayName = "DataPreviewTable";

function AlertBanner({
  variant,
  children,
}: {
  variant: "success" | "error" | "warning" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: FileSpreadsheet,
  };
  const Icon = icons[variant];

  return (
    <div
      className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border text-sm ${styles[variant]}`}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function XLSImport() {
  const [bookData, setBookData] = useState<any[]>([]);
  const [userData, setUserData] = useState<any[]>([]);
  const [excelLoaded, setExcelLoaded] = useState(false);
  const [importLog, setImportLog] = useState<LogEntry[]>([
    createLog("info", "Bereit für den Import."),
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<boolean | null>(null);
  const [fileName, setFileName] = useState("");

  const [importBooks, setImportBooks] = useState(true);
  const [importUsers, setImportUsers] = useState(true);
  const [dropBeforeImport, setDropBeforeImport] = useState(false);

  const bookCount = useMemo(() => Math.max(0, bookData.length - 1), [bookData]);
  const userCount = useMemo(() => Math.max(0, userData.length - 1), [userData]);
  const bookColumns = useMemo(
    () => (bookData[0] ? (bookData[0] as any[]).filter(Boolean).length : 0),
    [bookData],
  );
  const userColumns = useMemo(
    () => (userData[0] ? (userData[0] as any[]).filter(Boolean).length : 0),
    [userData],
  );

  const canImportBooks = bookCount > 0;
  const canImportUsers = userCount > 0;

  const canStartImport = useMemo(() => {
    return (importBooks && canImportBooks) || (importUsers && canImportUsers);
  }, [importBooks, importUsers, canImportBooks, canImportUsers]);

  const currentStep = importSuccess !== null ? 3 : excelLoaded ? 2 : 1;

  // ── Excel parsing ─────────────────────────────────────────────────────────

  const convertSheetToJson = useCallback((worksheet: ExcelJS.Worksheet) => {
    const json: any[] = [];

    const getCellValue = (cellValue: ExcelJS.CellValue): any => {
      if (cellValue === null || cellValue === undefined) return cellValue;
      if (typeof cellValue === "object" && "result" in cellValue)
        return (cellValue as ExcelJS.CellFormulaValue).result;
      if (typeof cellValue === "object" && "richText" in cellValue)
        return (cellValue as ExcelJS.CellRichTextValue).richText
          .map((rt) => rt.text)
          .join("");
      if (typeof cellValue === "object" && "hyperlink" in cellValue)
        return (
          (cellValue as ExcelJS.CellHyperlinkValue).text ||
          (cellValue as ExcelJS.CellHyperlinkValue).hyperlink
        );
      if (typeof cellValue === "object" && "error" in cellValue) return null;
      return cellValue;
    };

    worksheet.eachRow(
      { includeEmpty: false },
      (row: ExcelJS.Row, rowNumber: number) => {
        const rowValues = row.values as ExcelJS.CellValue[];
        if (rowNumber === 1) {
          json.push(rowValues.map((val) => getCellValue(val)));
        } else {
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

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const logs: LogEntry[] = [];
    setIsLoading(true);
    setImportSuccess(null);

    try {
      const file = event.target.files?.[0];
      if (!file) {
        setIsLoading(false);
        return;
      }

      setFileName(file.name);
      logs.push(
        createLog(
          "info",
          `Datei: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
          true,
        ),
      );

      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await file.arrayBuffer();
      logs.push(createLog("info", "Excel wird eingelesen…"));
      await workbook.xlsx.load(arrayBuffer);

      const sheetNames = workbook.worksheets.map((ws) => ws.name);
      logs.push(
        createLog(
          "info",
          `${workbook.worksheets.length} Arbeitsblätter gefunden: ${sheetNames.join(", ")}`,
        ),
      );

      // Books
      const worksheetBooks = workbook.worksheets[0];
      let booksJson: any[] = [];
      if (worksheetBooks) {
        booksJson = convertSheetToJson(worksheetBooks);
        const foundBooks = Math.max(0, booksJson.length - 1);
        const colCount = booksJson[0]
          ? (booksJson[0] as any[]).filter(Boolean).length
          : 0;
        if (foundBooks > 0) {
          logs.push(
            createLog(
              "success",
              `${foundBooks} Bücher mit ${colCount} Spalten erkannt (Blatt: "${worksheetBooks.name}")`,
            ),
          );
        } else {
          logs.push(
            createLog(
              "warning",
              `Blatt "${worksheetBooks.name}" enthält keine Datenzeilen`,
            ),
          );
        }
      } else {
        logs.push(
          createLog("warning", "Kein erstes Arbeitsblatt für Bücher gefunden"),
        );
      }
      setBookData(booksJson);

      // Users
      const worksheetUsers = workbook.worksheets[1];
      let usersJson: any[] = [];
      if (worksheetUsers) {
        usersJson = convertSheetToJson(worksheetUsers);
        const foundUsers = Math.max(0, usersJson.length - 1);
        const colCount = usersJson[0]
          ? (usersJson[0] as any[]).filter(Boolean).length
          : 0;
        if (foundUsers > 0) {
          logs.push(
            createLog(
              "success",
              `${foundUsers} User mit ${colCount} Spalten erkannt (Blatt: "${worksheetUsers.name}")`,
            ),
          );
        } else {
          logs.push(
            createLog(
              "warning",
              `Blatt "${worksheetUsers.name}" enthält keine Datenzeilen`,
            ),
          );
        }
      } else {
        logs.push(
          createLog("warning", "Kein zweites Arbeitsblatt für User gefunden"),
        );
      }
      setUserData(usersJson);

      setImportBooks(booksJson.length > 1);
      setImportUsers(usersJson.length > 1);
      setExcelLoaded(true);
      logs.push(
        createLog("success", "Datei erfolgreich geladen — bereit zum Import"),
      );
      setImportLog(logs);
    } catch (e: any) {
      logs.push(
        createLog("error", `Fehler beim Laden: ${e.message || e.toString()}`),
      );
      setImportLog(logs);
      setExcelLoaded(false);
    } finally {
      setIsLoading(false);
      event.target.value = "";
    }
  };

  const handleImportButton = async () => {
    setIsImporting(true);
    setImportSuccess(null);

    const normalizedBookData = importBooks ? normalizeBookData(bookData) : [];
    const normalizedUserData = importUsers ? normalizeUserData(userData) : [];

    const payload = {
      bookData: normalizedBookData,
      userData: normalizedUserData,
      importBooks: importBooks && canImportBooks,
      importUsers: importUsers && canImportUsers,
      dropBeforeImport,
    };

    setImportLog((prev) => [
      ...prev,
      createLog("separator", ""),
      createLog("info", "Datenbank-Import gestartet…", true),
      ...(dropBeforeImport
        ? [createLog("warning", "Bestehende Daten werden vorher gelöscht")]
        : []),
    ]);

    try {
      const response = await fetch("/api/excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok) {
        const logs = (result.logs as string[]) || [];
        setImportLog((prev) => [
          ...prev,
          ...logs.map((l) => createLog("info", l)),
          createLog(
            "success",
            `Import abgeschlossen: ${result.imported?.books || 0} Bücher, ${result.imported?.users || 0} User importiert`,
          ),
        ]);
        setImportSuccess(true);
      } else {
        const logs = (result.logs as string[]) || [];
        setImportLog((prev) => [
          ...prev,
          ...logs.map((l) => createLog("info", l)),
          createLog("error", result.data || "Unbekannter Fehler beim Import"),
        ]);
        setImportSuccess(false);
      }
    } catch (e: any) {
      setImportLog((prev) => [
        ...prev,
        createLog("error", `Netzwerk-Fehler: ${e.message || e.toString()}`),
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
    setImportLog([createLog("info", "Bereit für den Import.")]);
    setImportBooks(true);
    setImportUsers(true);
    setDropBeforeImport(false);
    setImportSuccess(null);
    setFileName("");
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Layout>
      <Head>
        <title>Excel-Import | OpenLibry</title>
      </Head>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Excel-Import</h1>
          <p className="text-sm text-gray-500 mt-1">
            Bücher und Nutzer aus einer Excel-Datei in die Datenbank importieren
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-1 mb-8 flex-wrap">
          <StepIndicator
            step={1}
            currentStep={currentStep}
            label="Datei laden"
          />
          <StepConnector active={currentStep >= 2} />
          <StepIndicator
            step={2}
            currentStep={currentStep}
            label="Prüfen & Konfigurieren"
          />
          <StepConnector active={currentStep >= 3} />
          <StepIndicator
            step={3}
            currentStep={currentStep}
            label="Importieren"
          />
        </div>

        {/* ── Step 1: File Upload ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <label
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm transition-all cursor-pointer hover:shadow-md active:scale-[0.98] ${
                isLoading || isImporting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{ backgroundColor: "#12556F" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Laden…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Excel-Datei auswählen
                </>
              )}
              <input
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isLoading || isImporting}
              />
            </label>

            {fileName && (
              <span className="text-sm text-gray-500 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                {fileName}
              </span>
            )}

            {excelLoaded && (
              <button
                onClick={handleReset}
                disabled={isImporting}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Zurücksetzen
              </button>
            )}
          </div>

          {/* Hint when no file loaded */}
          {!excelLoaded && !isLoading && (
            <div className="mt-4 p-4 border-2 border-dashed border-gray-200 rounded-xl text-center">
              <FileSpreadsheet className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                Erwartetes Format: Excel-Datei (.xlsx) mit Blatt 1 = Bücher,
                Blatt 2 = User
              </p>
              <p className="text-xs text-gray-300 mt-1">
                Tipp: Verwenden Sie den Excel-Export als Vorlage für das
                korrekte Spaltenformat
              </p>
            </div>
          )}

          {/* Data summary cards */}
          {excelLoaded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <DataSummaryCard
                icon={Book}
                label="Bücher"
                count={bookCount}
                columns={bookColumns}
                color={bookCount > 0 ? "#3b82f6" : "#9ca3af"}
              />
              <DataSummaryCard
                icon={Users}
                label="Nutzer"
                count={userCount}
                columns={userColumns}
                color={userCount > 0 ? "#8b5cf6" : "#9ca3af"}
              />
            </div>
          )}
        </div>

        {/* ── Step 2: Options & Preview ────────────────────────────── */}
        {excelLoaded && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Import-Optionen
            </h2>

            <div className="space-y-3">
              {/* Books checkbox */}
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                  importBooks && canImportBooks
                    ? "border-blue-200 bg-blue-50/50"
                    : "border-gray-100 bg-gray-50/50"
                } ${!canImportBooks ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={importBooks && canImportBooks}
                  onChange={(e) => setImportBooks(e.target.checked)}
                  disabled={!canImportBooks || isImporting}
                  className="w-4 h-4 rounded border-gray-300 text-[#12556F] focus:ring-[#12556F]/20"
                />
                <Book className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-sm text-gray-700">
                  {canImportBooks
                    ? `Bücher importieren (${bookCount.toLocaleString("de-DE")} Einträge)`
                    : "Bücher importieren (keine Daten vorhanden)"}
                </span>
              </label>

              {/* Users checkbox */}
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                  importUsers && canImportUsers
                    ? "border-violet-200 bg-violet-50/50"
                    : "border-gray-100 bg-gray-50/50"
                } ${!canImportUsers ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={importUsers && canImportUsers}
                  onChange={(e) => setImportUsers(e.target.checked)}
                  disabled={!canImportUsers || isImporting}
                  className="w-4 h-4 rounded border-gray-300 text-[#12556F] focus:ring-[#12556F]/20"
                />
                <Users className="w-4 h-4 text-violet-500 shrink-0" />
                <span className="text-sm text-gray-700">
                  {canImportUsers
                    ? `User importieren (${userCount.toLocaleString("de-DE")} Einträge)`
                    : "User importieren (keine Daten vorhanden)"}
                </span>
              </label>

              {/* Danger zone */}
              <div className="h-px bg-gray-100 my-1" />

              <label
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                  dropBeforeImport
                    ? "border-red-300 bg-red-50"
                    : "border-gray-100 bg-gray-50/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={dropBeforeImport}
                  onChange={(e) => setDropBeforeImport(e.target.checked)}
                  disabled={isImporting}
                  className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500/20"
                />
                <Trash2
                  className={`w-4 h-4 shrink-0 ${dropBeforeImport ? "text-red-500" : "text-gray-400"}`}
                />
                <span
                  className={`text-sm ${dropBeforeImport ? "text-red-700 font-medium" : "text-gray-500"}`}
                >
                  Alle vorhandenen Daten vor Import löschen
                </span>
              </label>

              {dropBeforeImport && (
                <AlertBanner variant="warning">
                  <strong>Achtung:</strong> Alle{" "}
                  {importBooks && importUsers
                    ? "Bücher und User"
                    : importBooks
                      ? "Bücher"
                      : "User"}{" "}
                  in der Datenbank werden unwiderruflich gelöscht, bevor die
                  neuen Daten eingespielt werden. Erstellen Sie vorher ein
                  Backup!
                </AlertBanner>
              )}

              {!canStartImport && (
                <AlertBanner variant="info">
                  Bitte wählen Sie mindestens eine Import-Option mit verfügbaren
                  Daten.
                </AlertBanner>
              )}
            </div>

            {/* Import button */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={handleImportButton}
                disabled={!canStartImport || isImporting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#12556F" }}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importiert…
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    In die Datenbank importieren
                  </>
                )}
              </button>

              {canStartImport && !isImporting && (
                <span className="text-xs text-gray-400">
                  {[
                    importBooks && canImportBooks && `${bookCount} Bücher`,
                    importUsers && canImportUsers && `${userCount} User`,
                  ]
                    .filter(Boolean)
                    .join(" und ")}{" "}
                  werden importiert
                  {dropBeforeImport ? " (mit Löschung)" : ""}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Result banner ────────────────────────────────────────── */}
        {importSuccess === true && (
          <div className="mb-6">
            <AlertBanner variant="success">
              Import erfolgreich abgeschlossen! Die Daten stehen jetzt in der
              Bibliothek zur Verfügung.
            </AlertBanner>
          </div>
        )}
        {importSuccess === false && (
          <div className="mb-6">
            <AlertBanner variant="error">
              Import fehlgeschlagen. Prüfen Sie die Details im Log unten.
            </AlertBanner>
          </div>
        )}

        {/* ── Log Panel ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Import-Log
            </span>
            <span className="text-xs text-gray-300">
              {importLog.filter((l) => l.level !== "separator").length} Einträge
            </span>
          </div>
          <div className="px-5 py-3 max-h-64 overflow-y-auto bg-gray-50/50">
            {importLog.map((entry, idx) => (
              <LogLine key={idx} entry={entry} />
            ))}
          </div>
        </div>

        {/* ── Data Preview ─────────────────────────────────────────── */}
        {excelLoaded && (
          <div className="space-y-6">
            {/* Books preview */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Book className="w-4 h-4 text-blue-500" />
                Vorschau: Bücher
                {bookCount > 0 && (
                  <span className="text-xs font-normal text-gray-400">
                    ({bookCount} Einträge, erste {Math.min(8, bookCount)}{" "}
                    angezeigt)
                  </span>
                )}
              </h3>
              {bookCount > 0 ? (
                <DataPreviewTable data={bookData} />
              ) : (
                <AlertBanner variant="info">
                  Keine Bücher-Daten im Excel gefunden. Stellen Sie sicher, dass
                  das erste Arbeitsblatt die Bücherliste enthält.
                </AlertBanner>
              )}
            </div>

            {/* Users preview */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-500" />
                Vorschau: User
                {userCount > 0 && (
                  <span className="text-xs font-normal text-gray-400">
                    ({userCount} Einträge, erste {Math.min(8, userCount)}{" "}
                    angezeigt)
                  </span>
                )}
              </h3>
              {userCount > 0 ? (
                <DataPreviewTable data={userData} />
              ) : (
                <AlertBanner variant="info">
                  Keine User-Daten im Excel gefunden. Stellen Sie sicher, dass
                  das zweite Arbeitsblatt die Userliste enthält.
                </AlertBanner>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
