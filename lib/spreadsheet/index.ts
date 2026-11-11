import { odsFormat } from "./ods";
import type { SheetTable, SpreadsheetFormat } from "./types";
import { xlsxFormat } from "./xlsx";

export * from "./types";

/**
 * Registry of supported import/export formats. To add a format, implement
 * SpreadsheetFormat in its own file and append it here. To drop one (e.g.
 * xlsx one day), remove it from this list.
 */
export const spreadsheetFormats: SpreadsheetFormat[] = [xlsxFormat, odsFormat];

export const defaultFormat = xlsxFormat;

export function getFormatById(id: string | undefined | null) {
  return spreadsheetFormats.find((f) => f.id === (id ?? "").toLowerCase());
}

export function getFormatByFileName(name: string) {
  const lower = name.toLowerCase();
  return spreadsheetFormats.find((f) =>
    f.extensions.some((ext) => lower.endsWith(ext)),
  );
}

/** Value for <input accept="...">. */
export const acceptedExtensions = spreadsheetFormats
  .flatMap((f) => f.extensions)
  .join(",");

/**
 * Legacy wire shape expected by POST /api/import: first element is the header
 * row (array), followed by one object per data row.
 */
export function toImportPayload(sheet: SheetTable | undefined): any[] {
  return sheet ? [sheet.header, ...sheet.rows] : [];
}
