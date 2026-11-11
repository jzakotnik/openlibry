/**
 * Format-neutral spreadsheet model.
 *
 * Every file format (xlsx, ods, ...) is an adapter that converts between a
 * binary file and a list of SheetTables. Everything else (DB access, column
 * mapping, validation) stays format-agnostic.
 *
 * Row objects are keyed by the *header text* of the column. Headers are pinned
 * to German (see lib/utils/xlsColumnsMapping.ts), independent of UI locale.
 */
export type Cell = string | number | boolean | null | undefined;
export type Row = Record<string, Cell>;

export interface SheetTable {
  name: string;
  header: string[];
  rows: Row[];
}

export interface SpreadsheetFormat {
  /** Value of the `?format=` query parameter. */
  id: string;
  /** Lower-case file extensions including the dot, e.g. ".xlsx". */
  extensions: string[];
  mime: string;
  /** Parse a file into tables (sheet order is preserved). */
  read(data: ArrayBuffer): Promise<SheetTable[]>;
  /** Serialize tables into a file. */
  write(sheets: SheetTable[]): Promise<Uint8Array>;
}
