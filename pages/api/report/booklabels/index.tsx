import { BookType } from "@/entities/BookType";
import { getAllBooks } from "@/entities/book";
import { chunkArray } from "@/lib/utils/chunkArray";
import { currentTime } from "@/lib/utils/dateutils";
import ReactPDF, {
  Canvas,
  Document,
  Page,
  Image as PdfImage,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import bwipjs from "bwip-js";
import { NextApiRequest, NextApiResponse } from "next";
const { join } = require("path");

import { prisma } from "@/entities/db";

var fs = require("fs");

type TextAlign = "left" | "center" | "right" | "justify";
// =============================================================================
// Default configuration values (matching documentation in environment-variables.md)
// =============================================================================

// Layout defaults
const DEFAULT_BOOKLABEL_MARGIN_LEFT = 1; // cm
const DEFAULT_BOOKLABEL_MARGIN_TOP = 2; // cm
const DEFAULT_BOOKLABEL_LABEL_WIDTH = 5.0; // cm
const DEFAULT_BOOKLABEL_LABEL_HEIGHT = 3.0; // cm
const DEFAULT_BOOKLABEL_ROWSONPAGE = 5;
const DEFAULT_BOOKLABEL_COLUMNSONPAGE = 2;
const DEFAULT_BOOKLABEL_LABEL_SPACING_HORIZONTAL = 0; // cm
const DEFAULT_BOOKLABEL_LABEL_SPACING_VERTICAL = 0; // cm
const DEFAULT_BOOKLABEL_MARGIN_IN_LABEL = 0; // cm
const DEFAULT_BOOKLABEL_PRINT_LABEL_FRAME = false;

// Barcode defaults
const DEFAULT_BOOKLABEL_BARCODE_WIDTH = "3cm";
const DEFAULT_BOOKLABEL_BARCODE_HEIGHT = "1.6cm";
const DEFAULT_BOOKLABEL_BARCODE_VERSION = "code128";
const DEFAULT_BOOKLABEL_BARCODE_PLACEHOLDER = "barcode";
const DEFAULT_BARCODE_MINCODELENGTH = 4;

// Author line defaults
const DEFAULT_BOOKLABEL_AUTHOR_SPACING = 1; // cm
const DEFAULT_BOOKLABEL_MAX_AUTHORLINE_LENGTH = 19;

// Content line defaults
const DEFAULT_BOOKLABEL_LINE_BELOW_1_LENGTH = 30;

// Logo default
const DEFAULT_BOOKLABEL_LOGO = "school_logo.png";

// Default line configurations (format: [content, fontSize, alignment])
const DEFAULT_BOOKLABEL_AUTHORLINE = ["Book.author", 8, "left"];
const DEFAULT_BOOKLABEL_LINE_BELOW_1 = ["Book.title", 10, "left"];
const DEFAULT_BOOKLABEL_LINE_BELOW_2 = ["firstTopic", 8, "left"];

// =============================================================================
// Configuration loading with fallbacks
// =============================================================================

// Layout settings
const BOOKLABEL_MARGIN_LEFT = process.env.BOOKLABEL_MARGIN_LEFT
  ? parseFloat(process.env.BOOKLABEL_MARGIN_LEFT)
  : DEFAULT_BOOKLABEL_MARGIN_LEFT;

const BOOKLABEL_MARGIN_TOP = process.env.BOOKLABEL_MARGIN_TOP
  ? parseFloat(process.env.BOOKLABEL_MARGIN_TOP)
  : DEFAULT_BOOKLABEL_MARGIN_TOP;

const BOOKLABEL_ROWSONPAGE = process.env.BOOKLABEL_ROWSONPAGE
  ? Number(process.env.BOOKLABEL_ROWSONPAGE)
  : DEFAULT_BOOKLABEL_ROWSONPAGE;

const BOOKLABEL_COLUMNSONPAGE = process.env.BOOKLABEL_COLUMNSONPAGE
  ? Number(process.env.BOOKLABEL_COLUMNSONPAGE)
  : DEFAULT_BOOKLABEL_COLUMNSONPAGE;

const BOOKLABEL_LABEL_WIDTH = process.env.BOOKLABEL_LABEL_WIDTH
  ? parseFloat(process.env.BOOKLABEL_LABEL_WIDTH)
  : DEFAULT_BOOKLABEL_LABEL_WIDTH;

const BOOKLABEL_LABEL_HEIGHT = process.env.BOOKLABEL_LABEL_HEIGHT
  ? parseFloat(process.env.BOOKLABEL_LABEL_HEIGHT)
  : DEFAULT_BOOKLABEL_LABEL_HEIGHT;

const BOOKLABEL_LABEL_SPACING_HORIZONTAL = process.env
  .BOOKLABEL_LABEL_SPACING_HORIZONTAL
  ? parseFloat(process.env.BOOKLABEL_LABEL_SPACING_HORIZONTAL)
  : DEFAULT_BOOKLABEL_LABEL_SPACING_HORIZONTAL;

const BOOKLABEL_LABEL_SPACING_VERTICAL = process.env
  .BOOKLABEL_LABEL_SPACING_VERTICAL
  ? parseFloat(process.env.BOOKLABEL_LABEL_SPACING_VERTICAL)
  : DEFAULT_BOOKLABEL_LABEL_SPACING_VERTICAL;

const BOOKLABEL_MARGIN_IN_LABEL = process.env.BOOKLABEL_MARGIN_IN_LABEL
  ? parseFloat(process.env.BOOKLABEL_MARGIN_IN_LABEL)
  : DEFAULT_BOOKLABEL_MARGIN_IN_LABEL;

const BOOKLABEL_PRINT_LABEL_FRAME: boolean = process.env
  .BOOKLABEL_PRINT_LABEL_FRAME
  ? JSON.parse(process.env.BOOKLABEL_PRINT_LABEL_FRAME)
  : DEFAULT_BOOKLABEL_PRINT_LABEL_FRAME;

// Barcode settings
const BOOKLABEL_BARCODE_WIDTH = process.env.BOOKLABEL_BARCODE_WIDTH
  ? process.env.BOOKLABEL_BARCODE_WIDTH
  : DEFAULT_BOOKLABEL_BARCODE_WIDTH;

const BOOKLABEL_BARCODE_HEIGHT = process.env.BOOKLABEL_BARCODE_HEIGHT
  ? process.env.BOOKLABEL_BARCODE_HEIGHT
  : DEFAULT_BOOKLABEL_BARCODE_HEIGHT;

const BOOKLABEL_BARCODE_VERSION = process.env.BOOKLABEL_BARCODE_VERSION
  ? process.env.BOOKLABEL_BARCODE_VERSION
  : DEFAULT_BOOKLABEL_BARCODE_VERSION;

const BOOKLABEL_BARCODE_PLACEHOLDER = process.env.BOOKLABEL_BARCODE_PLACEHOLDER
  ? process.env.BOOKLABEL_BARCODE_PLACEHOLDER
  : DEFAULT_BOOKLABEL_BARCODE_PLACEHOLDER;

const BARCODE_MINCODELENGTH = process.env.BARCODE_MINCODELENGTH
  ? parseInt(process.env.BARCODE_MINCODELENGTH)
  : DEFAULT_BARCODE_MINCODELENGTH;

// Author line settings
const BOOKLABEL_AUTHOR_SPACING = process.env.BOOKLABEL_AUTHOR_SPACING
  ? parseFloat(process.env.BOOKLABEL_AUTHOR_SPACING)
  : DEFAULT_BOOKLABEL_AUTHOR_SPACING;

const BOOKLABEL_MAX_AUTHORLINE_LENGTH = process.env
  .BOOKLABEL_MAX_AUTHORLINE_LENGTH
  ? parseInt(process.env.BOOKLABEL_MAX_AUTHORLINE_LENGTH)
  : DEFAULT_BOOKLABEL_MAX_AUTHORLINE_LENGTH;

const BOOKLABEL_LINE_BELOW_1_LENGTH = process.env.BOOKLABEL_LINE_BELOW_1_LENGTH
  ? parseInt(process.env.BOOKLABEL_LINE_BELOW_1_LENGTH)
  : DEFAULT_BOOKLABEL_LINE_BELOW_1_LENGTH;

// Line configurations with defaults
const BOOKLABEL_AUTHORLINE = process.env.BOOKLABEL_AUTHORLINE
  ? JSON.parse(process.env.BOOKLABEL_AUTHORLINE)
  : DEFAULT_BOOKLABEL_AUTHORLINE;

const BOOKLABEL_LINE_ABOVE = process.env.BOOKLABEL_LINE_ABOVE
  ? JSON.parse(process.env.BOOKLABEL_LINE_ABOVE)
  : null; // No default - optional

const BOOKLABEL_LINE_BELOW_1 = process.env.BOOKLABEL_LINE_BELOW_1
  ? JSON.parse(process.env.BOOKLABEL_LINE_BELOW_1)
  : DEFAULT_BOOKLABEL_LINE_BELOW_1;

const BOOKLABEL_LINE_BELOW_2 = process.env.BOOKLABEL_LINE_BELOW_2
  ? JSON.parse(process.env.BOOKLABEL_LINE_BELOW_2)
  : DEFAULT_BOOKLABEL_LINE_BELOW_2;

// Points per centimeter (for PDF rendering)
const pointPerCm = 28.3464566929;

// Load school logo with fallback and error handling
const logoPath = process.env.BOOKLABEL_LOGO || DEFAULT_BOOKLABEL_LOGO;
let schoollogo: Buffer | null = null;
try {
  schoollogo = fs.readFileSync(join(process.cwd(), "/public/" + logoPath));
} catch (error) {
  console.warn(
    `Warning: Could not load book label logo at /public/${logoPath}. ` +
      `Logo will not be shown if BOOKLABEL_BARCODE_PLACEHOLDER is set to 'logo'.`,
  );
}

// =============================================================================
// Styles
// =============================================================================
const styles = StyleSheet.create({
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
    fontSize: 8,
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "flex-start",
  },
  pageContainer: {
    flexDirection: "column",
    alignContent: "flex-start",
    justifyContent: "flex-start",
  },
  labelRowContainer: {
    flexDirection: "row",
    alignContent: "flex-start",
    justifyContent: "flex-start",
  },
  labelContainer: {
    flexDirection: "row",
    alignContent: "flex-start",
    justifyContent: "flex-start",
  },
  barCodeContainer: {
    flexDirection: "column",
    alignContent: "flex-start",
    justifyContent: "flex-start",
  },
});

// =============================================================================
// Helper functions
// =============================================================================

/**
 * Draw optional label frame for debugging/alignment.
 */
const labelFrame = ({ id }: { id: number | string }) => {
  if (BOOKLABEL_PRINT_LABEL_FRAME) {
    return (
      <Canvas
        key={`frame-${id}`}
        paint={(painterObject) =>
          painterObject
            .rect(
              0,
              0,
              BOOKLABEL_LABEL_WIDTH * pointPerCm,
              BOOKLABEL_LABEL_HEIGHT * pointPerCm,
            )
            .stroke()
        }
      />
    );
  }
  return null;
};

/**
 * Generate rotated author line on left side of label.
 */
const authorLine = (b: BookType) => {
  if (BOOKLABEL_AUTHORLINE == null) return null;
  return (
    <Text
      style={{
        transformOrigin: "0% 0%",
        transform: "rotate(-90deg)",
        fontSize: BOOKLABEL_AUTHORLINE[1],
        left: BOOKLABEL_MARGIN_IN_LABEL + "cm",
        width: BOOKLABEL_LABEL_HEIGHT + "cm",
        textAlign: BOOKLABEL_AUTHORLINE[2],
      }}
    >
      {replacePlaceholder(BOOKLABEL_AUTHORLINE[0], b)}
    </Text>
  );
};

/**
 * Calculate maximum height available for title text.
 */
const getMaxTitleHeight = (useMaxSpace: boolean, pointsize: number): number => {
  if (!useMaxSpace) {
    return pointsize / pointPerCm;
  }
  // Use all space not used by other lines
  return (
    BOOKLABEL_LABEL_HEIGHT -
    2 * BOOKLABEL_MARGIN_IN_LABEL -
    parseFloat(BOOKLABEL_BARCODE_HEIGHT.split("cm")[0]) -
    getHeightForLine(BOOKLABEL_LINE_BELOW_1) -
    getHeightForLine(BOOKLABEL_LINE_BELOW_2)
  );
};

/**
 * Get height for a configured line.
 */
const getHeightForLine = (
  lineConfig: [string, number, string] | null,
): number => {
  if (lineConfig == null) return 0;
  return lineConfig[1] / pointPerCm;
};

/**
 * Generate an info line (above or below barcode).
 */
const infoLine = (
  b: BookType,
  lineConfig: [string, number, string] | null,
  useMaxSpace: boolean,
) => {
  if (lineConfig == null) return null;

  const titleHeight = getMaxTitleHeight(useMaxSpace, lineConfig[1]);
  const maxTextWidth =
    BOOKLABEL_LABEL_WIDTH -
    BOOKLABEL_AUTHOR_SPACING -
    2 * BOOKLABEL_MARGIN_IN_LABEL;

  return (
    <Text
      style={{
        fontSize: lineConfig[1],
        maxHeight: titleHeight + "cm",
        maxWidth: maxTextWidth + "cm",
        textAlign: lineConfig[2] as TextAlign,
        left: BOOKLABEL_AUTHOR_SPACING + "cm",
      }}
    >
      {replacePlaceholder(lineConfig[0], b)}
    </Text>
  );
};

/**
 * Replace Book.* and firstTopic placeholders with actual book data.
 */
const replacePlaceholder = (input: string, book: BookType): string => {
  try {
    const replaceBookProps = (original: string): string => {
      if (!original.includes("Book.")) return original;

      const nextReplace = String(
        original.split(" ").find((item: string) => item.includes("Book.")),
      );
      const propertyName = nextReplace.split(".")[1] as keyof BookType;
      const bookValue = book[propertyName];
      const replaced = original.replaceAll(
        nextReplace,
        bookValue != null ? String(bookValue) : "",
      );
      const propertyIsAuthor = original === "Book.author";

      const replacedShortened =
        replaced.length > BOOKLABEL_MAX_AUTHORLINE_LENGTH
          ? replaced
              .substring(0, BOOKLABEL_MAX_AUTHORLINE_LENGTH - 3)
              .concat("...")
          : replaced;

      return propertyIsAuthor ? replacedShortened : replaced;
    };

    const replaceTopics = (original: string): string => {
      if (!original.includes("firstTopic")) return original;

      // Split topics into array and trim
      const topics: string[] = book.topics
        ? book.topics.split(";").map((topic: string) => topic.trim())
        : [];

      // Create comma-separated list of topics
      const combinedTopics = topics.join(", ");

      // Replace all occurrences of "firstTopic"
      const allReplacedTopics = original.replaceAll(
        "firstTopic",
        combinedTopics,
      );

      const replacedShortened =
        allReplacedTopics.length > BOOKLABEL_LINE_BELOW_1_LENGTH
          ? allReplacedTopics
              .substring(0, BOOKLABEL_LINE_BELOW_1_LENGTH - 3)
              .concat("...")
          : allReplacedTopics;

      return replacedShortened;
    };

    // Recursive replacement until no "Book." remains
    const resolveBookProps = (text: string): string =>
      text.includes("Book.") ? resolveBookProps(replaceBookProps(text)) : text;

    // Recursive replacement until no "firstTopic" remains
    const resolveTopics = (text: string): string =>
      text.includes("firstTopic") ? resolveTopics(replaceTopics(text)) : text;

    const withBooks = resolveBookProps(input);
    const finalText = resolveTopics(withBooks);

    return finalText;
  } catch (error) {
    console.error("Error replacing placeholder in book label:", error);
    return "Configuration error in environment";
  }
};

/**
 * Generate barcode/logo images for all books.
 */
const generateBarcode = async (
  books: Array<BookType>,
  ignoreLabelFields: number[],
) => {
  const labelsOnPage = BOOKLABEL_ROWSONPAGE * BOOKLABEL_COLUMNSONPAGE;

  const allcodes = await Promise.all(
    books.map(async (b: BookType, i: number) => {
      if (b.id == null) {
        // This is an empty element for a label that is already used - skip it
        return null;
      }

      const horizontalIndex = i % BOOKLABEL_COLUMNSONPAGE;
      const verticalIndex = Math.floor(
        (i % labelsOnPage) / BOOKLABEL_COLUMNSONPAGE,
      );

      // Pad the ID to minimum length with leading zeros
      const barId = b.id!.toString().padStart(BARCODE_MINCODELENGTH, "0");

      // Generate barcode or use logo based on placeholder setting
      let imageData: Buffer;
      try {
        if (BOOKLABEL_BARCODE_PLACEHOLDER === "barcode") {
          imageData = await bwipjs.toBuffer({
            bcid: BOOKLABEL_BARCODE_VERSION,
            text: barId,
            scale: 3,
            height: 10,
            includetext: true,
            textxalign: "center",
          });
        } else if (schoollogo) {
          imageData = schoollogo;
        } else {
          // Fallback to barcode if logo not available
          console.warn(
            `Logo not available, falling back to barcode for book ${b.id}`,
          );
          imageData = await bwipjs.toBuffer({
            bcid: BOOKLABEL_BARCODE_VERSION,
            text: barId,
            scale: 3,
            height: 10,
            includetext: true,
            textxalign: "center",
          });
        }
      } catch (error) {
        console.error(`Error generating barcode for book ${b.id}:`, error);
        return null;
      }

      const pos = {
        left:
          BOOKLABEL_MARGIN_LEFT +
          horizontalIndex * BOOKLABEL_LABEL_WIDTH +
          horizontalIndex * BOOKLABEL_LABEL_SPACING_HORIZONTAL,
        top:
          BOOKLABEL_MARGIN_TOP +
          BOOKLABEL_LABEL_HEIGHT * verticalIndex +
          verticalIndex * BOOKLABEL_LABEL_SPACING_VERTICAL,
      };

      console.log("Position", pos, i);

      return (
        <View key={`label-${b.id}`}>
          <View
            style={{
              position: "absolute",
              flexDirection: "column",
              left: pos.left + "cm",
              top: pos.top + "cm",
              width: BOOKLABEL_LABEL_WIDTH + "cm",
              padding: 0,
              margin: 0,
            }}
          >
            {labelFrame({ id: b.id! })}
          </View>

          <View
            style={{
              position: "absolute",
              flexDirection: "column",
              left: pos.left + "cm",
              top: pos.top + BOOKLABEL_LABEL_HEIGHT + "cm",
              width: BOOKLABEL_LABEL_WIDTH + "cm",
              padding: 0,
              margin: 0,
            }}
          >
            {authorLine(b)}
          </View>

          <View
            style={{
              position: "absolute",
              flexDirection: "column",
              left: pos.left + "cm",
              top: pos.top + "cm",
              width:
                BOOKLABEL_LABEL_WIDTH - 2 * BOOKLABEL_MARGIN_IN_LABEL + "cm",
              padding: 0,
              margin: BOOKLABEL_MARGIN_IN_LABEL + "cm",
            }}
          >
            <View
              style={{
                flexDirection: "column",
              }}
            >
              {infoLine(b, BOOKLABEL_LINE_ABOVE, true)}
              <PdfImage
                key={`barcode-${b.id}`}
                src={"data:image/png;base64, " + imageData.toString("base64")}
                style={{
                  width: BOOKLABEL_BARCODE_WIDTH,
                  height: BOOKLABEL_BARCODE_HEIGHT,
                  alignContent: "center",
                  left: BOOKLABEL_AUTHOR_SPACING + "cm",
                }}
              />
              {infoLine(b, BOOKLABEL_LINE_BELOW_1, true)}
              {infoLine(b, BOOKLABEL_LINE_BELOW_2, true)}
            </View>
          </View>
        </View>
      );
    }),
  );

  return allcodes.filter((code) => code !== null);
};

/**
 * Create PDF document with book labels.
 */
async function createLabelsPDF(
  books: Array<BookType>,
  ignoreLabelFields: number[],
) {
  const barcodes = await generateBarcode(books, ignoreLabelFields);
  const barcodesSections = chunkArray(
    barcodes,
    BOOKLABEL_ROWSONPAGE * BOOKLABEL_COLUMNSONPAGE,
  );

  console.log(
    "Total barcodes:",
    barcodes.length,
    "Pages:",
    barcodesSections.length,
  );

  const pdfstream = ReactPDF.renderToStream(
    <Document>
      {barcodesSections.map((chunk, i) => (
        <Page
          wrap
          key={i}
          size="A4"
          style={{
            flexDirection: "column",
            backgroundColor: "#FFFFFF",
          }}
        >
          <View key={`page-${i}`} style={styles.pageContainer}>
            {chunk}
          </View>
        </Page>
      ))}
    </Document>,
  );

  console.log("PDF rendered successfully");
  return pdfstream;
}

// =============================================================================
// API Handler
// =============================================================================
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET": {
      console.log("Printing book labels via API");
      try {
        const allbooks = (await getAllBooks(prisma)) as Array<BookType>;

        // Parse topic filter
        const topicFilter =
          "topic" in req.query
            ? (req.query.topic! as string).toLowerCase()
            : null;

        const parseTopics = (topicsString: string | null): string[] => {
          if (!topicsString) return [];
          return topicsString.split(";").map((topic) => topic.trim());
        };

        const topicsArray = parseTopics(topicFilter);

        // Parse ID filter (multiple IDs allowed)
        const idFilter: number[] =
          "id" in req.query
            ? (Array.isArray(req.query.id) ? req.query.id : [req.query.id]).map(
                (e) => parseInt(e as string, 10),
              )
            : [];

        // Parse block/skip positions
        const ignoreLabelFields: number[] =
          "block" in req.query
            ? (Array.isArray(req.query.block)
                ? req.query.block
                : [req.query.block]
              ).map((e) => parseInt(e as string, 10))
            : [];

        console.log("Filters - topics:", topicFilter, "ids:", idFilter);

        // Filter books by topic and/or ID
        const books = allbooks
          .filter((b: BookType) => {
            // Check if topics exist and is a non-empty string
            if (typeof b.topics !== "string" || !b.topics.trim()) {
              return topicsArray.length === 0; // Include if no topic filter
            }
            // If no topic filter, include all books
            if (topicsArray.length === 0) return true;

            // Split book topics into array
            const bookTopicsArray = b.topics
              .split(";")
              .map((topic) => topic.trim().toLowerCase());

            // Check for exact topic match
            return topicsArray.some((topic) =>
              bookTopicsArray.includes(topic.toLowerCase()),
            );
          })
          .filter((b: BookType) =>
            idFilter.length > 0 ? !!b.id && idFilter.indexOf(b.id) > -1 : true,
          );

        // Error if no books found
        if (!books || books.length === 0) {
          return res
            .status(400)
            .json({ data: "ERROR: No books matching search criteria" });
        }

        // Index-range selection (start/end)
        const hasIndexRange = "start" in req.query || "end" in req.query;
        const rawStartIndex =
          "start" in req.query ? parseInt(req.query.start as string, 10) : 0;
        const rawEndIndex =
          "end" in req.query
            ? parseInt(req.query.end as string, 10)
            : books.length;
        const startIndex = hasIndexRange
          ? Math.min(rawStartIndex, rawEndIndex)
          : rawStartIndex;
        const endIndex = hasIndexRange
          ? Math.max(rawStartIndex, rawEndIndex)
          : rawEndIndex;

        const printableByIndex = hasIndexRange
          ? (() => {
              if (rawStartIndex > rawEndIndex) {
                console.log("Swapping start and end indices (were reversed)");
              }
              const sliced = books.slice(startIndex, endIndex);
              console.log(
                "Printing labels for books by index range:",
                startIndex,
                "to",
                endIndex,
                "count:",
                sliced.length,
              );
              return sliced;
            })()
          : null;

        // ID-range selection (startId/endId)
        const hasIdRange = "startId" in req.query && "endId" in req.query;
        const rawStartId =
          "startId" in req.query
            ? parseInt(req.query.startId as string, 10)
            : 0;
        const rawEndId =
          "endId" in req.query
            ? parseInt(req.query.endId as string, 10)
            : (books[0]?.id ?? 0);
        const startId = hasIdRange
          ? Math.min(rawStartId, rawEndId)
          : rawStartId;
        const endId = hasIdRange ? Math.max(rawStartId, rawEndId) : rawEndId;

        const printableById = hasIdRange
          ? (() => {
              if (rawStartId > rawEndId) {
                console.log("Swapping startId and endId (were reversed)");
              }
              console.log(
                "Printing labels for books by ID range:",
                startId,
                "to",
                endId,
              );
              return books.filter((b) => b.id! >= startId && b.id! <= endId);
            })()
          : null;

        const printableBooks = printableByIndex ?? printableById ?? books;

        console.log("Total printable books:", printableBooks.length);

        if (!printableBooks || printableBooks.length === 0) {
          return res
            .status(400)
            .json({ data: "ERROR: No books matching search criteria" });
        }

        // Base empty book used for skipped label positions
        const emptyBook: BookType = {
          title: "",
          subtitle: "",
          author: "",
          renewalCount: 0,
          rentalStatus: "available",
          topics: ";",
          rentedDate: currentTime(),
          dueDate: currentTime(),
        };

        // Insert empty books at skip indices
        const printableBooksWithSkips = (() => {
          if (ignoreLabelFields.length === 0) return printableBooks;
          const sortedSkips = [...ignoreLabelFields].sort((a, b) => a - b);
          const result = [...printableBooks];
          sortedSkips.forEach((idx) => {
            const pos = Math.max(0, Math.min(idx, result.length));
            result.splice(pos, 0, emptyBook);
          });
          return result;
        })();

        const labels = await createLabelsPDF(
          printableBooksWithSkips,
          ignoreLabelFields,
        );

        res.writeHead(200, { "Content-Type": "application/pdf" });
        labels.pipe(res);
      } catch (error) {
        console.error("Error generating book labels:", error);
        res.status(400).json({ data: "ERROR: " + error });
      }
      break;
    }

    default: {
      res.status(405).end(`${req.method} Not Allowed`);
      break;
    }
  }
}
