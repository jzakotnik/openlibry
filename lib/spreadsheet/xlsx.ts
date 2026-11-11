import Excel from "exceljs";
import { XLSX_META } from "./formats";
import type { Cell, Row, SheetTable, SpreadsheetFormat } from "./types";

function cellValue(v: Excel.CellValue): Cell {
  if (v === null || v === undefined) return v as null | undefined;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") {
    if ("result" in v)
      return cellValue((v as Excel.CellFormulaValue).result as Excel.CellValue);
    if ("richText" in v)
      return (v as Excel.CellRichTextValue).richText
        .map((r) => r.text)
        .join("");
    if ("hyperlink" in v)
      return (
        (v as Excel.CellHyperlinkValue).text ||
        (v as Excel.CellHyperlinkValue).hyperlink
      );
    return null; // error cells etc.
  }
  return v as Cell;
}

export const xlsxFormat: SpreadsheetFormat = {
  ...XLSX_META,

  async read(data) {
    const workbook = new Excel.Workbook();
    await workbook.xlsx.load(data as any);
    return workbook.worksheets.map((ws): SheetTable => {
      let header: string[] = [];
      const rows: Row[] = [];
      ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        const values = row.values as Excel.CellValue[]; // 1-based
        if (rowNumber === 1) {
          header = [];
          values.forEach((v, i) => {
            header[i - 1] = String(cellValue(v) ?? "");
          });
          return;
        }
        const obj: Row = {};
        values.forEach((v, i) => {
          const h = header[i - 1];
          if (h) obj[h] = cellValue(v);
        });
        rows.push(obj);
      });
      return { name: ws.name, header: header.filter(Boolean), rows };
    });
  },

  async write(sheets) {
    const workbook = new Excel.Workbook();
    for (const sheet of sheets) {
      const ws = workbook.addWorksheet(sheet.name);
      ws.columns = sheet.header.map((h) => ({ header: h, key: h }));
      sheet.rows.forEach((r) => ws.addRow(r));
    }
    return new Uint8Array((await workbook.xlsx.writeBuffer()) as ArrayBuffer);
  },
};
