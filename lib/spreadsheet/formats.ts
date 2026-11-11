/**
 * Lightweight, dependency-free format metadata (single source of truth).
 * UI code (e.g. the export dropdown) imports this file only, so the heavy
 * adapter libraries (exceljs, jszip) are not pulled into every page bundle.
 */
export interface FormatMeta {
  /** Value of the `?format=` query parameter. */
  id: string;
  /** Label shown in format pickers. */
  label: string;
  /** Lower-case file extensions including the dot; first one is canonical. */
  extensions: string[];
  mime: string;
}

export const XLSX_META: FormatMeta = {
  id: "xlsx",
  label: "Excel (.xlsx)",
  extensions: [".xlsx", ".xls"],
  mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export const ODS_META: FormatMeta = {
  id: "ods",
  label: "OpenDocument (.ods)",
  extensions: [".ods"],
  mime: "application/vnd.oasis.opendocument.spreadsheet",
};

/** Order = order in format pickers; first entry is the default. */
export const formatMetas: FormatMeta[] = [XLSX_META, ODS_META];
