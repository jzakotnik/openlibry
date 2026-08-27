import { getAllBooks } from "@/entities/book";
import { prisma } from "@/entities/db";
import { LogEvents } from "@/lib/logEvents";
import { errorLogger } from "@/lib/logger";
import {
  Document,
  Image,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import sharp from "sharp";

// =============================================================================
// Types
// =============================================================================

interface BookEntry {
  id: number;
  isbn: string | null;
  title: string;
  subtitle: string | null;
  author: string | null;
  coverSrc: string | undefined;
}

// =============================================================================
// Cover image resolution + compression
// =============================================================================

/**
 * Thumbnail dimensions embedded in the PDF.
 * Keeping these small dramatically reduces PDF file size.
 */
const THUMB_WIDTH = 80;
const THUMB_HEIGHT = 112; // ~portrait A5 aspect ratio
const SCHOOL_NAME = process.env.SCHOOL_NAME || "";

/**
 * Compress an image buffer with sharp:
 *   - Resize to thumbnail dimensions (fit: cover, no upscale)
 *   - Convert to baseline JPEG (pdfkit does NOT support progressive JPEGs)
 *   - Quality 60 — good enough for a small thumbnail
 */
async function compressToThumb(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .resize(THUMB_WIDTH, THUMB_HEIGHT, {
      fit: "cover",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 60, progressive: false })
    .toBuffer();
}

/**
 * Resolves a cover image for the given book ID from local storage only.
 * Mirrors the lookup logic in pages/api/images/[id].ts:
 *   - Path: COVERIMAGE_FILESTORAGE_PATH/{bookId}.jpg
 *   - Falls back to default.jpg in the same directory if present
 *   - Returns undefined (blank placeholder) if neither file exists
 *
 * No network requests are made to avoid rate-limiting by external providers.
 */
async function resolveCoverSrc(bookId: number): Promise<string | undefined> {
  const basePath = process.env.COVERIMAGE_FILESTORAGE_PATH;
  if (!basePath || !fs.existsSync(basePath)) return undefined;

  const filePath = path.join(basePath, `${bookId}.jpg`);
  const defaultPath = path.join(basePath, "default.jpg");

  const targetPath = fs.existsSync(filePath)
    ? filePath
    : fs.existsSync(defaultPath)
      ? defaultPath
      : null;

  if (!targetPath) return undefined;

  try {
    const raw = fs.readFileSync(targetPath);
    const thumb = await compressToThumb(raw);
    return `data:image/jpeg;base64,${thumb.toString("base64")}`;
  } catch {
    return undefined;
  }
}

// =============================================================================
// NFC normalisation helper
// =============================================================================

function nfc(str: string | null | undefined): string {
  if (!str) return "";
  return str.normalize("NFC");
}

// =============================================================================
// PDF Styles
// =============================================================================

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 9,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 3,
    borderBottomColor: "#1976d2",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1976d2",
  },
  headerMeta: {
    fontSize: 8,
    color: "#888",
    textAlign: "right",
  },

  // ── Grid: 2-column layout ─────────────────────────────────────────────────
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    width: "48.5%",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    padding: 8,
    backgroundColor: "#fafafa",
    gap: 8,
    marginBottom: 6,
  },

  // ── Cover ─────────────────────────────────────────────────────────────────
  coverWrapper: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    flexShrink: 0,
    backgroundColor: "#e8edf2",
    borderRadius: 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  coverImage: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    objectFit: "cover",
  },
  coverPlaceholder: {
    fontSize: 7,
    color: "#aaa",
    textAlign: "center",
  },

  // ── Text ──────────────────────────────────────────────────────────────────
  textBlock: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 3,
  },
  bookTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1a1a1a",
    lineHeight: 1.3,
  },
  bookSubtitle: {
    fontSize: 8,
    color: "#555",
    fontStyle: "italic",
    lineHeight: 1.3,
  },
  bookAuthor: {
    fontSize: 8,
    color: "#333",
    marginTop: 2,
  },
  bookIsbn: {
    fontSize: 7,
    color: "#aaa",
    marginTop: 4,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    fontSize: 7,
    color: "#bbb",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#ececec",
    paddingTop: 6,
  },
});

// =============================================================================
// PDF Document
// =============================================================================

const CatalogDocument = ({ books }: { books: BookEntry[] }) => {
  const today = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <Document
      title="Bibliothekskatalog"
      author="OpenLibry"
      subject={`Katalogübersicht ${SCHOOL_NAME} ${today}`}
    >
      <Page size="A4" style={styles.page} wrap>
        {/* ── Header ── */}
        <View style={styles.header} fixed>
          <Text style={styles.headerTitle}>
            Bibliothekskatalog {SCHOOL_NAME}
          </Text>
          <Text style={styles.headerMeta}>
            {books.length} Bücher{"\n"}Stand: {today}
          </Text>
        </View>

        {/* ── Book Grid ── */}
        <View style={styles.grid}>
          {books.map((book) => (
            <View key={book.id} style={styles.card} wrap={false}>
              {/* Cover */}
              <View style={styles.coverWrapper}>
                {book.coverSrc ? (
                  <Image
                    src={book.coverSrc}
                    style={styles.coverImage}
                    // react-pdf will silently skip unresolvable remote URLs;
                    // the placeholder below acts as a visual fallback via the
                    // coverWrapper background color.
                  />
                ) : (
                  <Text style={styles.coverPlaceholder}>Kein{"\n"}Cover</Text>
                )}
              </View>

              {/* Metadata */}
              <View style={styles.textBlock}>
                <Text style={styles.bookTitle}>
                  {book.title.length > 80
                    ? book.title.substring(0, 80) + "…"
                    : book.title}
                </Text>
                {book.subtitle ? (
                  <Text style={styles.bookSubtitle}>
                    {book.subtitle.length > 60
                      ? book.subtitle.substring(0, 60) + "…"
                      : book.subtitle}
                  </Text>
                ) : null}
                {book.author ? (
                  <Text style={styles.bookAuthor}>
                    {book.author.length > 50
                      ? book.author.substring(0, 50) + "…"
                      : book.author}
                  </Text>
                ) : null}
                {book.isbn ? (
                  <Text style={styles.bookIsbn}>ISBN {book.isbn}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        {/* ── Footer (repeated on every page) ── */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `OpenLibry • Katalogbericht vom ${today} • Seite ${pageNumber} von ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

// =============================================================================
// API Handler
// =============================================================================

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // ── 1. Fetch all books ─────────────────────────────────────────────────
    const rawBooks = await getAllBooks(prisma);

    // ── 2. Normalise strings + resolve/compress covers in parallel ────────
    const books: BookEntry[] = await Promise.all(
      rawBooks.map(async (b) => ({
        id: b.id,
        isbn: b.isbn ?? null,
        title: nfc(b.title) || "Ohne Titel",
        subtitle: nfc(b.subtitle) || null,
        author: nfc(b.author) || null,
        coverSrc: await resolveCoverSrc(b.id),
      })),
    );

    // ── 3. Render PDF ─────────────────────────────────────────────────────
    // .toBuffer() returns a ReadableStream in newer @react-pdf/renderer versions;
    // collect all chunks into a single Buffer before sending.
    const stream = await pdf(<CatalogDocument books={books} />).toBuffer();
    const buffer: Buffer = await new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", reject);
    });

    // ── 4. Stream response ────────────────────────────────────────────────
    const today = new Date().toISOString().split("T")[0];
    const filename = `katalog_${today}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length);

    return res.status(200).send(buffer);
  } catch (error) {
    errorLogger.error(
      { event: LogEvents.API_ERROR, endpoint: "/api/report/pdfcatalog", error },
      "Error generating catalog PDF",
    );
    return res.status(500).json({
      error: "Fehler beim Erstellen des Katalog-PDFs",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
