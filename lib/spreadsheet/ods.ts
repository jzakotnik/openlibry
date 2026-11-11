import JSZip from "jszip";
import { ODS_META } from "./formats";
import type { Cell, Row, SheetTable, SpreadsheetFormat } from "./types";

const NS_OFFICE = "urn:oasis:names:tc:opendocument:xmlns:office:1.0";
const NS_TABLE = "urn:oasis:names:tc:opendocument:xmlns:table:1.0";
const NS_TEXT = "urn:oasis:names:tc:opendocument:xmlns:text:1.0";

const MIME = ODS_META.mime;

/** Guard against files that "repeat" an empty cell/row a million times. */
const MAX_REPEAT = 1000;

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    // strip characters that are illegal in XML 1.0
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");

function writeCell(v: Cell): string {
  if (v === null || v === undefined || v === "") return "<table:table-cell/>";
  if (typeof v === "number" && Number.isFinite(v))
    return `<table:table-cell office:value-type="float" office:value="${v}"><text:p>${v}</text:p></table:table-cell>`;
  if (typeof v === "boolean")
    return `<table:table-cell office:value-type="boolean" office:boolean-value="${v}"><text:p>${v ? "TRUE" : "FALSE"}</text:p></table:table-cell>`;
  const paragraphs = String(v)
    .split(/\r?\n/)
    .map((line) => `<text:p>${esc(line)}</text:p>`)
    .join("");
  return `<table:table-cell office:value-type="string">${paragraphs}</table:table-cell>`;
}

const ODF_VERSION = "1.2";

/** Namespaces Excel/LibreOffice expect on the root elements. */
const NS_DECL =
  `xmlns:office="${NS_OFFICE}" xmlns:table="${NS_TABLE}" xmlns:text="${NS_TEXT}" ` +
  `xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" ` +
  `xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" ` +
  `xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" ` +
  `xmlns:number="urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0" ` +
  `xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" ` +
  `xmlns:dc="http://purl.org/dc/elements/1.1/"`;

function writeContent(sheets: SheetTable[]): string {
  const tables = sheets
    .map((s) => {
      const columns = `<table:table-column table:style-name="co1" table:number-columns-repeated="${Math.max(s.header.length, 1)}" table:default-cell-style-name="Default"/>`;
      const head = `<table:table-row>${s.header
        .map((h) => writeCell(h))
        .join("")}</table:table-row>`;
      const body = s.rows
        .map(
          (r) =>
            `<table:table-row>${s.header
              .map((h) => writeCell(r[h]))
              .join("")}</table:table-row>`,
        )
        .join("");
      return `<table:table table:name="${esc(s.name)}" table:style-name="ta1">${columns}${head}${body}</table:table>`;
    })
    .join("");
  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<office:document-content ${NS_DECL} office:version="${ODF_VERSION}">` +
    `<office:scripts/>` +
    `<office:font-face-decls><style:font-face style:name="Arial" svg:font-family="Arial" style:font-family-generic="swiss"/></office:font-face-decls>` +
    `<office:automatic-styles>` +
    `<style:style style:name="co1" style:family="table-column"><style:table-column-properties fo:break-before="auto" style:column-width="2.5cm"/></style:style>` +
    `<style:style style:name="ta1" style:family="table"><style:table-properties table:display="true" style:writing-mode="lr-tb"/></style:style>` +
    `</office:automatic-styles>` +
    `<office:body><office:spreadsheet>${tables}</office:spreadsheet></office:body>` +
    `</office:document-content>`
  );
}

const STYLES =
  `<?xml version="1.0" encoding="UTF-8"?>` +
  `<office:document-styles ${NS_DECL} office:version="${ODF_VERSION}">` +
  `<office:font-face-decls><style:font-face style:name="Arial" svg:font-family="Arial" style:font-family-generic="swiss"/></office:font-face-decls>` +
  `<office:styles><style:default-style style:family="table-cell"><style:text-properties style:font-name="Arial" fo:font-size="10pt"/></style:default-style>` +
  `<style:style style:name="Default" style:family="table-cell"/></office:styles>` +
  `<office:automatic-styles/>` +
  `<office:master-styles/>` +
  `</office:document-styles>`;

const metaXml = () =>
  `<?xml version="1.0" encoding="UTF-8"?>` +
  `<office:document-meta ${NS_DECL} office:version="${ODF_VERSION}">` +
  `<office:meta><meta:generator>OpenLibry</meta:generator>` +
  `<meta:creation-date>${new Date().toISOString().slice(0, 19)}</meta:creation-date></office:meta>` +
  `</office:document-meta>`;

const MANIFEST =
  `<?xml version="1.0" encoding="UTF-8"?>` +
  `<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="${ODF_VERSION}">` +
  `<manifest:file-entry manifest:full-path="/" manifest:version="${ODF_VERSION}" manifest:media-type="${MIME}"/>` +
  `<manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>` +
  `<manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>` +
  `<manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/>` +
  `</manifest:manifest>`;

/** Text of a <text:p>, honouring <text:s/>, <text:tab/> and <text:line-break/>. */
function paragraphText(p: Element): string {
  let out = "";
  Array.from(p.childNodes).forEach((n) => {
    if (n.nodeType === 3) out += n.nodeValue ?? "";
    else if (n.nodeType === 1) {
      const el = n as Element;
      if (el.namespaceURI === NS_TEXT && el.localName === "s")
        out += " ".repeat(Number(el.getAttributeNS(NS_TEXT, "c")) || 1);
      else if (el.namespaceURI === NS_TEXT && el.localName === "tab")
        out += "\t";
      else if (el.namespaceURI === NS_TEXT && el.localName === "line-break")
        out += "\n";
      else out += paragraphText(el);
    }
  });
  return out;
}

function readCell(cell: Element): Cell {
  const type = cell.getAttributeNS(NS_OFFICE, "value-type");
  if (!type) return null;
  if (type === "float" || type === "percentage" || type === "currency") {
    const n = Number(cell.getAttributeNS(NS_OFFICE, "value"));
    return Number.isNaN(n) ? null : n;
  }
  if (type === "boolean")
    return cell.getAttributeNS(NS_OFFICE, "boolean-value") === "true";
  if (type === "date") {
    // "2024-05-17" or "2024-05-17T10:00:00" -> keep the day, like our own export
    return (cell.getAttributeNS(NS_OFFICE, "date-value") || "").slice(0, 10);
  }
  const text = Array.from(cell.getElementsByTagNameNS(NS_TEXT, "p"))
    .map(paragraphText)
    .join("\n");
  return text === "" ? null : text;
}

/** Element children only (basic DOM API, so it also works outside browsers). */
function elementChildren(el: Element): Element[] {
  return Array.from(el.childNodes).filter(
    (n): n is Element => n.nodeType === 1,
  );
}

function childrenOf(el: Element, localName: string): Element[] {
  return elementChildren(el).filter(
    (c) => c.namespaceURI === NS_TABLE && c.localName === localName,
  );
}

function readTable(table: Element): SheetTable {
  const grid: Cell[][] = [];
  const rowEls = childrenOf(table, "table-row");
  // rows can also sit in <table:table-row-group>/<table-header-rows>
  childrenOf(table, "table-header-rows")
    .concat(childrenOf(table, "table-row-group"))
    .forEach((g) => rowEls.push(...childrenOf(g, "table-row")));

  for (const rowEl of rowEls) {
    const cells: Cell[] = [];
    const cellEls = elementChildren(rowEl).filter(
      (c) =>
        c.namespaceURI === NS_TABLE &&
        (c.localName === "table-cell" || c.localName === "covered-table-cell"),
    );
    for (const c of cellEls) {
      const repeat = Math.min(
        Number(c.getAttributeNS(NS_TABLE, "number-columns-repeated")) || 1,
        MAX_REPEAT,
      );
      const v = readCell(c);
      for (let i = 0; i < repeat; i++) cells.push(v);
    }
    const repeatRows = Math.min(
      Number(rowEl.getAttributeNS(NS_TABLE, "number-rows-repeated")) || 1,
      MAX_REPEAT,
    );
    const empty = cells.every((v) => v === null || v === undefined);
    if (empty) continue; // matches exceljs includeEmpty:false
    for (let i = 0; i < repeatRows; i++) grid.push(cells);
  }

  const headerCells = grid[0] ?? [];
  const header = headerCells.map((h) => (h == null ? "" : String(h)));
  const rows: Row[] = grid.slice(1).map((cells) => {
    const obj: Row = {};
    header.forEach((h, i) => {
      if (h) obj[h] = cells[i] ?? null;
    });
    return obj;
  });
  return {
    name: table.getAttributeNS(NS_TABLE, "name") || "",
    header: header.filter(Boolean),
    rows,
  };
}

export const odsFormat: SpreadsheetFormat = {
  ...ODS_META,

  async read(data) {
    const zip = await JSZip.loadAsync(data);
    const contentFile = zip.file("content.xml");
    if (!contentFile) throw new Error("Invalid ODS file: content.xml missing");
    const xml = await contentFile.async("string");
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    if (doc.getElementsByTagName("parsererror").length)
      throw new Error("Invalid ODS file: content.xml is not valid XML");
    return Array.from(doc.getElementsByTagNameNS(NS_TABLE, "table"))
      .filter(
        (t) => (t.parentNode as Element | null)?.localName === "spreadsheet",
      )
      .map(readTable);
  },

  async write(sheets) {
    const zip = new JSZip();
    // The mimetype entry must come first and be stored uncompressed.
    zip.file("mimetype", MIME, { compression: "STORE" });
    // createFolders:false -> no explicit "META-INF/" directory entry in the zip
    const opts = { createFolders: false };
    zip.file("META-INF/manifest.xml", MANIFEST, opts);
    zip.file("content.xml", writeContent(sheets), opts);
    zip.file("styles.xml", STYLES, opts);
    zip.file("meta.xml", metaXml(), opts);
    return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  },
};
