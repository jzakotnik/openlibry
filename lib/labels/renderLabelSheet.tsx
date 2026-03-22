/**
 * Label PDF Rendering Engine
 *
 * Pure rendering logic: takes a SheetConfig, LabelTemplate, books, and
 * optional positions → produces a PDF stream via @react-pdf/renderer.
 *
 * Reuses the existing @react-pdf/renderer and bwip-js dependencies.
 */

import ReactPDF, {
  Document,
  Page,
  Image as PdfImage,
  Text,
  View,
} from "@react-pdf/renderer";
import bwipjs from "bwip-js";

import type {
  BookLabelData,
  LabelFieldConfig,
  LabelFieldContent,
  LabelPosition,
  LabelTemplate,
  SheetConfig,
} from "./types";

// ─── Constants ─────────────────────────────────────────────────────

/** Points per mm (PDF standard: 72pt per inch, 25.4mm per inch) */
const PT_PER_MM = 72 / 25.4; // ≈ 2.835

function mm(value: number): string {
  return `${value * PT_PER_MM}pt`;
}

function mmNum(value: number): number {
  return value * PT_PER_MM;
}

/** Minimum barcode ID length (padded with leading zeros) */
const BARCODE_MIN_LENGTH = 4;

// ─── Position Computation ──────────────────────────────────────────

/**
 * Compute the list of grid positions for each page.
 *
 * Returns an array of pages, where each page is an array of
 * { row, col } positions that should be printed on that page.
 *
 * @param sheet - Sheet configuration
 * @param bookCount - Number of books to print
 * @param positions - Optional explicit positions for page 1
 * @param startPosition - Optional start position for page 1
 */
export function computePagePositions(
  sheet: SheetConfig,
  bookCount: number,
  positions?: LabelPosition[],
  startPosition?: LabelPosition,
): LabelPosition[][] {
  const { columns, rows } = sheet.grid;
  const labelsPerSheet = columns * rows;

  // Generate a full page of positions
  const fullPage = (): LabelPosition[] => {
    const result: LabelPosition[] = [];
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= columns; c++) {
        result.push({ row: r, col: c });
      }
    }
    return result;
  };

  // Determine first-page positions
  let firstPagePositions: LabelPosition[];

  if (positions && positions.length > 0) {
    // Explicit positions provided — use exactly those for page 1
    firstPagePositions = positions;
  } else if (startPosition) {
    // Start from a specific position, fill to end of page
    firstPagePositions = fullPage().filter((pos) => {
      const posIndex = (pos.row - 1) * columns + (pos.col - 1);
      const startIndex =
        (startPosition.row - 1) * columns + (startPosition.col - 1);
      return posIndex >= startIndex;
    });
  } else {
    // Full page from (1,1)
    firstPagePositions = fullPage();
  }

  // Distribute books across pages
  const pages: LabelPosition[][] = [];
  let booksRemaining = bookCount;

  // Page 1: use computed first-page positions
  const page1Count = Math.min(booksRemaining, firstPagePositions.length);
  pages.push(firstPagePositions.slice(0, page1Count));
  booksRemaining -= page1Count;

  // Subsequent pages: full sheets
  while (booksRemaining > 0) {
    const full = fullPage();
    const pageCount = Math.min(booksRemaining, full.length);
    pages.push(full.slice(0, pageCount));
    booksRemaining -= pageCount;
  }

  return pages;
}

// ─── Coordinate Computation ────────────────────────────────────────

/**
 * Compute the x,y origin (top-left corner) of a label in mm,
 * given its grid position (1-indexed).
 */
function labelOrigin(
  sheet: SheetConfig,
  pos: LabelPosition,
): { x: number; y: number } {
  return {
    x:
      sheet.margins.left +
      (pos.col - 1) * (sheet.label.width + sheet.gap.horizontal),
    y:
      sheet.margins.top +
      (pos.row - 1) * (sheet.label.height + sheet.gap.vertical),
  };
}

function truncate(text: string, maxLength?: number): string {
  if (!maxLength || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 1) + "…";
}

// ─── Text Auto-Sizing ──────────────────────────────────────────────

/**
 * Estimate a font size that fits text within a given width and height.
 *
 * This is a heuristic: we assume ~0.6 × fontSize per character width
 * on average (reasonable for Latin text in a standard sans-serif font).
 * The result is clamped to [4, fontSizeMax].
 */
function autoFontSize(
  text: string,
  widthMm: number,
  heightMm: number,
  fontSizeMax: number,
): number {
  if (!text || fontSizeMax <= 0) return fontSizeMax || 8;

  const widthPt = mmNum(widthMm);
  const heightPt = mmNum(heightMm);

  // Estimate: each character is ~0.55 × fontSize wide
  const charWidthRatio = 0.55;

  // Size that fits width (single line)
  const sizeByWidth =
    text.length > 0 ? widthPt / (text.length * charWidthRatio) : fontSizeMax;

  // Size that fits height (single line, ~1.2 line height)
  const sizeByHeight = heightPt / 1.2;

  // Take the minimum and clamp
  const computed = Math.min(sizeByWidth, sizeByHeight, fontSizeMax);
  return Math.max(4, Math.min(computed, fontSizeMax));
}

// ─── Barcode Generation ────────────────────────────────────────────

/**
 * Generate a barcode PNG as a base64 data URI.
 */
async function generateBarcodeDataUri(text: string): Promise<string | null> {
  if (!text) return null;

  try {
    // Pad to minimum length
    const padded = text.padStart(BARCODE_MIN_LENGTH, "0");

    const pngBuffer = await bwipjs.toBuffer({
      bcid: "code128",
      text: padded,
      scale: 3,
      height: 15,
      includetext: true,
      textxalign: "center",
    });

    return `data:image/png;base64,${pngBuffer.toString("base64")}`;
  } catch (error) {
    console.error(`Error generating barcode for "${text}":`, error);
    return null;
  }
}

// ─── Field Content Resolution ──────────────────────────────────────

/**
 * Get the text value for a field content type from a book.
 */
function getFieldText(
  content: LabelFieldContent,
  book: BookLabelData,
  maxLength?: number, // ← new
): string {
  let text: string;
  switch (content) {
    case "title":
      text = book.title || "";
      break;
    case "subtitle":
      text = book.subtitle || "";
      break;
    case "author":
      text = book.author || "";
      break;
    case "id":
      text = book.id || "";
      break;
    case "school":
      text = process.env.SCHOOL_NAME || "";
      break;
    case "topics": {
      if (!book.topics) {
        text = "";
        break;
      }
      text = book.topics
        .split(";")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 3)
        .join(", ");
      break;
      // Note: the old hardcoded 17-char cap is now removed —
      // use maxLength in the config instead
    }
    case "barcode":
    case "none":
    default:
      text = "";
  }
  return truncate(text, maxLength);
}
// ─── Single Label Component ────────────────────────────────────────

interface LabelProps {
  book: BookLabelData;
  template: LabelTemplate;
  labelWidth: number; // mm
  labelHeight: number; // mm
  barcodeUri: string | null;
}

/**
 * Render a single label's content (the L-shaped layout).
 *
 * Layout (all measurements derived from template config):
 *
 *   ┌──────────┬───────────────────────┐
 *   │          │  horizontal1          │
 *   │  spine   ├───────────────────────┤
 *   │ (rotated │  horizontal2          │
 *   │  90° CCW)├───────────────────────┤
 *   │          │  horizontal3          │
 *   └──────────┴───────────────────────┘
 */
function LabelContent({
  book,
  template,
  labelWidth,
  labelHeight,
  barcodeUri,
}: LabelProps) {
  const padding = template.padding;
  const spineWidth = (labelWidth * template.spineWidthPercent) / 100;
  const contentWidth = labelWidth - spineWidth;
  const rowHeight = (labelHeight - 2 * padding) / 3;

  const spineText = getFieldText(
    template.fields.spine.content,
    book,
    template.fields.spine.maxLength,
  );
  const spineFontSize = autoFontSize(
    spineText,
    labelHeight - 2 * padding, // rotated: "width" is the label height
    spineWidth - 2 * padding, // rotated: "height" is the spine width
    template.fields.spine.fontSizeMax,
  );

  return (
    <View
      style={{
        width: mm(labelWidth),
        height: mm(labelHeight),
        flexDirection: "row",
        overflow: "hidden",
      }}
    >
      {/* Spine (left vertical field) */}
      <View
        style={{
          width: mm(spineWidth),
          height: mm(labelHeight),
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: mm(labelHeight - 2 * padding),
            height: mm(spineWidth - 2 * padding),
            transformOrigin: "50% 50%",
            transform: "rotate(-90deg)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: spineFontSize,
              textAlign: template.fields.spine.align,
              width: "100%",
            }}
          >
            {spineText}
          </Text>
        </View>
      </View>

      {/* Right side: 3 horizontal fields stacked */}
      <View
        style={{
          width: mm(contentWidth),
          height: mm(labelHeight),
          flexDirection: "column",
          paddingTop: mm(padding),
          paddingBottom: mm(padding),
          paddingRight: mm(padding),
        }}
      >
        {(["horizontal1", "horizontal2", "horizontal3"] as const).map(
          (fieldKey) => {
            const fieldConfig = template.fields[fieldKey];
            return (
              <HorizontalField
                key={fieldKey}
                book={book}
                fieldConfig={fieldConfig}
                widthMm={contentWidth - padding}
                heightMm={rowHeight}
                barcodeUri={barcodeUri}
              />
            );
          },
        )}
      </View>
    </View>
  );
}

// ─── Horizontal Field Component ────────────────────────────────────

interface HorizontalFieldProps {
  book: BookLabelData;
  fieldConfig: LabelFieldConfig;
  widthMm: number;
  heightMm: number;
  barcodeUri: string | null;
}

function HorizontalField({
  book,
  fieldConfig,
  widthMm,
  heightMm,
  barcodeUri,
}: HorizontalFieldProps) {
  // Barcode field
  if (fieldConfig.content === "barcode") {
    if (!barcodeUri) {
      return <View style={{ width: mm(widthMm), height: mm(heightMm) }} />;
    }
    return (
      <View
        style={{
          width: mm(widthMm),
          height: mm(heightMm),
          justifyContent: "center",
          alignItems:
            fieldConfig.align === "left"
              ? "flex-start"
              : fieldConfig.align === "right"
                ? "flex-end"
                : "center",
        }}
      >
        <PdfImage
          src={barcodeUri}
          style={{
            width: mm(widthMm),
            height: mm(heightMm),
            objectFit: "contain",
          }}
        />
      </View>
    );
  }

  // Empty / none field
  if (fieldConfig.content === "none") {
    return <View style={{ width: mm(widthMm), height: mm(heightMm) }} />;
  }

  // Text field
  const text = getFieldText(fieldConfig.content, book, fieldConfig.maxLength);
  const fontSize = autoFontSize(
    text,
    widthMm,
    heightMm,
    fieldConfig.fontSizeMax,
  );

  return (
    <View
      style={{
        width: mm(widthMm),
        height: mm(heightMm),
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Text
        style={{
          fontSize,
          textAlign: fieldConfig.align,
          maxLines: heightMm > 10 ? 2 : 1,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

// ─── Full PDF Document ─────────────────────────────────────────────

interface PageOfLabelsProps {
  sheet: SheetConfig;
  template: LabelTemplate;
  /** Books for this page, matched 1:1 with positions */
  books: BookLabelData[];
  /** Grid positions for each book on this page */
  positions: LabelPosition[];
  /** Pre-generated barcode data URIs, keyed by book index in the full list */
  barcodeUris: Map<number, string | null>;
  /** Offset into the full book list (for barcode URI lookup) */
  bookOffset: number;
}

function PageOfLabels({
  sheet,
  template,
  books,
  positions,
  barcodeUris,
  bookOffset,
}: PageOfLabelsProps) {
  return (
    <Page
      size="A4"
      style={{
        backgroundColor: "#FFFFFF",
      }}
    >
      {books.map((book, i) => {
        const pos = positions[i];
        if (!pos) return null;

        const origin = labelOrigin(sheet, pos);

        return (
          <View
            key={`label-${bookOffset + i}`}
            style={{
              position: "absolute",
              left: mm(origin.x),
              top: mm(origin.y),
            }}
          >
            <LabelContent
              book={book}
              template={template}
              labelWidth={sheet.label.width}
              labelHeight={sheet.label.height}
              barcodeUri={barcodeUris.get(bookOffset + i) ?? null}
            />
          </View>
        );
      })}
    </Page>
  );
}

// ─── Main Render Function ──────────────────────────────────────────

/**
 * Render a label PDF.
 *
 * This is the main entry point for the rendering engine.
 * It takes configuration + data and returns a readable stream
 * of the PDF.
 *
 * @param sheet - Physical sheet configuration
 * @param template - Label content template
 * @param books - Book data to render
 * @param positions - Optional explicit positions for page 1
 * @param startPosition - Optional start position for page 1
 * @returns ReadableStream of the PDF
 */
export async function renderLabelSheet(
  sheet: SheetConfig,
  template: LabelTemplate,
  books: BookLabelData[],
  positions?: LabelPosition[],
  startPosition?: LabelPosition,
): Promise<NodeJS.ReadableStream> {
  // 1. Pre-generate all barcode images
  const barcodeUris = new Map<number, string | null>();

  const needsBarcode =
    template.fields.spine.content === "barcode" ||
    template.fields.horizontal1.content === "barcode" ||
    template.fields.horizontal2.content === "barcode" ||
    template.fields.horizontal3.content === "barcode";

  if (needsBarcode) {
    await Promise.all(
      books.map(async (book, i) => {
        // Use ISBN if available, otherwise use ID for barcode
        const barcodeText = book.id;
        const uri = await generateBarcodeDataUri(barcodeText);
        barcodeUris.set(i, uri);
      }),
    );
  }

  // 2. Compute page layout
  const pagePositions = computePagePositions(
    sheet,
    books.length,
    positions,
    startPosition,
  );

  // 3. Distribute books across pages
  let bookIndex = 0;
  const pages: Array<{
    books: BookLabelData[];
    positions: LabelPosition[];
    offset: number;
  }> = [];

  for (const pagePos of pagePositions) {
    const pageBooks = books.slice(bookIndex, bookIndex + pagePos.length);
    pages.push({
      books: pageBooks,
      positions: pagePos,
      offset: bookIndex,
    });
    bookIndex += pagePos.length;
  }

  // 4. Render PDF
  const pdfStream = ReactPDF.renderToStream(
    <Document>
      {pages.map((page, pageIndex) => (
        <PageOfLabels
          key={pageIndex}
          sheet={sheet}
          template={template}
          books={page.books}
          positions={page.positions}
          barcodeUris={barcodeUris}
          bookOffset={page.offset}
        />
      ))}
    </Document>,
  );

  return pdfStream;
}
