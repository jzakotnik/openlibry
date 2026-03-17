/**
 * POST /api/labels/generate
 *
 * Generate a PDF of book labels.
 *
 * Template resolution (priority order):
 *   1. `template`: inline template object (for editor preview)
 *   2. `templateId`: ID of a saved template
 *
 * Book data:
 *   - `books`: explicit BookLabelData[] for scripting/external use
 *   - `bookFilter`: query books from the OpenLibry database
 *
 * Position control:
 *   - `positions`: explicit grid coordinates for page 1
 *   - `startPosition`: fill from this position on page 1
 *   - neither: fill entire sheets from (1,1)
 *
 * Response: application/pdf
 */

import { getAllBooks } from "@/entities/book";
import { BookType } from "@/entities/BookType";
import { prisma } from "@/entities/db";
import type { NextApiRequest, NextApiResponse } from "next";

import { getSheetConfig, getTemplate } from "@/lib/labels/labelConfig";
import { renderLabelSheet } from "@/lib/labels/renderLabelSheet";
import type {
  BookFilter,
  BookLabelData,
  GenerateLabelRequest,
  LabelTemplate,
} from "@/lib/labels/types";

/**
 * Resolve books from a filter query against the database.
 */
async function resolveBookFilter(filter: BookFilter): Promise<BookLabelData[]> {
  const allBooks = (await getAllBooks(prisma)) as Array<BookType>;

  let filtered: BookType[];

  switch (filter.type) {
    case "all":
      filtered = allBooks;
      break;

    case "latest":
      filtered = [...allBooks]
        .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
        .slice(0, filter.count ?? 50);
      break;

    case "topic": {
      const topicSearch = (filter.value ?? "").toLowerCase();
      filtered = allBooks.filter((b) => {
        if (!b.topics) return false;
        const bookTopics = b.topics
          .split(";")
          .map((t) => t.trim().toLowerCase());
        return bookTopics.some((t) => t.includes(topicSearch));
      });
      break;
    }

    case "ids":
      if (!filter.ids || filter.ids.length === 0) {
        filtered = [];
      } else {
        const idSet = new Set(filter.ids);
        filtered = allBooks.filter((b) => b.id != null && idSet.has(b.id));
      }
      break;

    default:
      filtered = [];
  }

  return filtered.map((b) => ({
    id: b.id != null ? String(b.id) : "",
    title: b.title ?? "",
    author: b.author ?? "",
    subtitle: b.subtitle ?? "",
    isbn: b.isbn ?? undefined,
    topics: b.topics ?? undefined,
  }));
}

/**
 * Validate that an inline template object has all required fields.
 */
function isValidTemplate(t: unknown): t is LabelTemplate {
  if (!t || typeof t !== "object") return false;
  const tmpl = t as Record<string, unknown>;
  if (typeof tmpl.spineWidthPercent !== "number") return false;
  if (typeof tmpl.padding !== "number") return false;
  if (!tmpl.fields || typeof tmpl.fields !== "object") return false;

  const fields = tmpl.fields as Record<string, unknown>;
  const requiredFields = ["spine", "horizontal1", "horizontal2", "horizontal3"];
  for (const key of requiredFields) {
    if (!fields[key] || typeof fields[key] !== "object") return false;
    const field = fields[key] as Record<string, unknown>;
    if (typeof field.content !== "string") return false;
  }

  return true;
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).end(`${req.method} Not Allowed`);
  }

  try {
    const body = req.body as GenerateLabelRequest;

    // ── Validate required fields ──────────────────────────────────

    if (!body.sheetConfigId) {
      return res.status(400).json({ error: "sheetConfigId is required" });
    }
    if (!body.templateId && !body.template) {
      return res
        .status(400)
        .json({ error: "Either templateId or template (inline) is required" });
    }

    // ── Load sheet config ─────────────────────────────────────────

    const sheet = getSheetConfig(body.sheetConfigId);
    if (!sheet) {
      return res.status(404).json({
        error: `Sheet config "${body.sheetConfigId}" not found`,
      });
    }

    // ── Resolve template: inline takes priority ───────────────────

    let template: LabelTemplate;

    if (body.template) {
      if (!isValidTemplate(body.template)) {
        return res.status(400).json({
          error: "Inline template is missing required fields",
        });
      }
      template = body.template;
    } else {
      const saved = getTemplate(body.templateId!);
      if (!saved) {
        return res.status(404).json({
          error: `Template "${body.templateId}" not found`,
        });
      }
      template = saved;
    }

    // ── Resolve books ─────────────────────────────────────────────

    let books: BookLabelData[];

    if (body.books && body.books.length > 0) {
      books = body.books;
    } else if (body.bookFilter) {
      books = await resolveBookFilter(body.bookFilter);
    } else {
      return res.status(400).json({
        error: "Either 'books' or 'bookFilter' must be provided",
      });
    }

    if (books.length === 0) {
      return res.status(400).json({
        error: "No books found matching the criteria",
      });
    }

    // ── Validate positions ────────────────────────────────────────

    if (body.positions) {
      const { columns, rows } = sheet.grid;
      for (const pos of body.positions) {
        if (pos.row < 1 || pos.row > rows || pos.col < 1 || pos.col > columns) {
          return res.status(400).json({
            error: `Position (${pos.row}, ${pos.col}) is out of bounds for grid ${columns}×${rows}`,
          });
        }
      }
    }

    if (body.startPosition) {
      const { columns, rows } = sheet.grid;
      const sp = body.startPosition;
      if (sp.row < 1 || sp.row > rows || sp.col < 1 || sp.col > columns) {
        return res.status(400).json({
          error: `startPosition (${sp.row}, ${sp.col}) is out of bounds for grid ${columns}×${rows}`,
        });
      }
    }

    // ── Render PDF ────────────────────────────────────────────────

    console.log(
      `Generating labels: ${books.length} books on ${sheet.name} ` +
        `with template "${template.name || "(inline preview)"}"`,
    );

    const pdfStream = await renderLabelSheet(
      sheet,
      template,
      books,
      body.positions,
      body.startPosition,
    );

    // Inline content-disposition for preview, attachment for regular downloads
    const isPreview = !!body.template;
    const disposition = isPreview
      ? "inline"
      : `attachment; filename="buchetiketten-${new Date().toISOString().slice(0, 10)}.pdf"`;

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": disposition,
    });

    pdfStream.pipe(res);
  } catch (error) {
    console.error("Error generating label PDF:", error);
    return res.status(500).json({ error: "Failed to generate PDF" });
  }
}
