import { getRentedBooksWithUsers } from "@/entities/book";
import { prisma } from "@/entities/db";
import { t } from "@/lib/i18n";
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";
import { resolveCustomPath } from "@/lib/utils/customPath";
import dayjs from "dayjs";
import Docxtemplater from "docxtemplater";
import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import PizZip from "pizzip";

// =============================================================================
// Optional: angular-expressions parser for better template resilience.
//
// Word editors split placeholder text like {overdue_username} across multiple
// XML runs (e.g. {overdue_ in one run, username} in another). The angular
// parser reassembles fragmented tags more reliably than the default parser.
// It also enables dot-notation and expressions in templates.
//
// Install:  npm install angular-expressions
// Without it, the default docxtemplater parser is used — it handles simple
// {tag} placeholders fine but may fail on aggressively reformatted templates.
// =============================================================================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let angularParser: ((tag: string) => any) | undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const expressions = require("angular-expressions");
  angularParser = (tag: string) => {
    tag = tag.replace(/^\.$/, "this").replace(/''/g, "'");
    const expr = expressions.compile(tag);
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get: (scope: any, context: any) => {
        let obj = {};
        const scopeList = context.scopeList;
        const num = context.num;
        for (let i = 0, len = num + 1; i < len; i++) {
          obj = Object.assign(obj, scopeList[i]);
        }
        return expr(scope, obj);
      },
    };
  };
} catch {
  // angular-expressions not installed — using default parser
}

// =============================================================================
// Configuration (env vars with sensible defaults)
//
// Defaults are pinned to German because the default `mahnung-template.docx`
// itself is a German letter — the SCHOOL_NAME and REMINDER_RESPONSIBLE_NAME
// fallbacks are designed to fit naturally into the German template wording.
// English-locale deployments are expected to set these env vars (and provide
// their own translated docx template under database/custom/).
// =============================================================================
const SCHOOL_NAME = process.env.SCHOOL_NAME || "Schule";
const REMINDER_RESPONSIBLE_NAME =
  process.env.REMINDER_RESPONSIBLE_NAME || "Schulbücherei";
const REMINDER_RESPONSIBLE_EMAIL =
  process.env.REMINDER_RESPONSIBLE_EMAIL || "buecherei@schule.de";
const REMINDER_RENEWAL_COUNT = process.env.REMINDER_RENEWAL_COUNT
  ? parseInt(process.env.REMINDER_RENEWAL_COUNT, 10)
  : 5;
const REMINDER_TEMPLATE_DOC =
  process.env.REMINDER_TEMPLATE_DOC || "mahnung-template.docx";

// =============================================================================
// Template placeholder vocabulary
//
// This is the single source of truth for what placeholders are available.
// The validation endpoint checks the template against this list.
//
// IMPORTANT: These placeholder names are wire-protocol identifiers used inside
// .docx templates and MUST NEVER be translated. They are reproduced verbatim
// in user-visible validation messages by passing them brace-wrapped into the
// t() interpolation (e.g. tag: "{book_list}").
// =============================================================================
const TOP_LEVEL_PLACEHOLDERS = [
  "school_name",
  "responsible_name",
  "responsible_contact_email",
  "firstName",
  "lastName",
  "overdue_username",
  "schoolGrade",
  "reminder_min_count",
  "today_date",
] as const;

const LOOP_NAME = "book_list";

const LOOP_PLACEHOLDERS = ["title", "author", "rentedDate", "bookId"] as const;

// All valid tags the template may contain (including loop markers)
const KNOWN_TAGS = new Set<string>([
  ...TOP_LEVEL_PLACEHOLDERS,
  `#${LOOP_NAME}`,
  `/${LOOP_NAME}`,
  ...LOOP_PLACEHOLDERS,
]);

// =============================================================================
// Type definitions
// =============================================================================
type ReminderMode = "all" | "non-extendable";

interface BookListItem {
  title: string;
  author: string;
  rentedDate: string;
  bookId: number;
}

interface ReminderData {
  school_name: string;
  responsible_name: string;
  responsible_contact_email: string;
  firstName: string;
  lastName: string;
  overdue_username: string;
  schoolGrade: string;
  reminder_min_count: number;
  today_date: string;
  book_list: BookListItem[];
}

interface RentalRecord {
  id: number;
  title: string | null;
  author: string | null;
  rentedDate: Date | null;
  dueDate: Date | null;
  renewalCount: number;
  user: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    schoolGrade: string | null;
  } | null;
}

interface ReminderPostBody {
  bookIds: number[];
}

// =============================================================================
// Template loading (per-request for hot-reloading without restart)
// =============================================================================
function loadTemplate(): { buffer: Buffer; path: string } {
  const resolvedPath = resolveCustomPath(REMINDER_TEMPLATE_DOC);

  const buffer = fs.readFileSync(resolvedPath);
  businessLogger.info(
    {
      event: LogEvents.REMINDER_TEMPLATE_LOADED,
      path: resolvedPath,
    },
    "Reminder template loaded",
  );
  return { buffer, path: resolvedPath };
}

// =============================================================================
// Template tag extraction
//
// Extracts all {placeholder} tags from the Word document XML. Works by
// reading all <w:t> text runs in order and joining them — this naturally
// reassembles tags that Word split across multiple XML runs.
// =============================================================================
function extractTemplateTags(templateBuffer: Buffer): string[] {
  const zip = new PizZip(templateBuffer);
  const xmlFile = zip.file("word/document.xml");
  if (!xmlFile) return [];

  const xml = xmlFile.asText();

  // Extract text content from all <w:t> elements in document order
  const textParts: string[] = [];
  const textRunRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  let runMatch;
  while ((runMatch = textRunRegex.exec(xml)) !== null) {
    textParts.push(runMatch[1]);
  }
  const fullText = textParts.join("");

  // Find all {tag} patterns including loop markers like {#book_list}
  const tags = new Set<string>();
  const tagRegex = /\{([^}]+)\}/g;
  let tagMatch;
  while ((tagMatch = tagRegex.exec(fullText)) !== null) {
    tags.add(tagMatch[1].trim());
  }
  return Array.from(tags);
}

// =============================================================================
// Template validation
// =============================================================================
interface TemplateValidation {
  valid: boolean;
  templatePath: string;
  foundTags: string[];
  unknownTags: string[];
  missingTopLevel: string[];
  missingLoop: string[];
  hasBookListLoop: boolean;
  errors: string[];
  warnings: string[];
}

function validateTemplate(
  templateBuffer: Buffer,
  templatePath: string,
): TemplateValidation {
  const result: TemplateValidation = {
    valid: true,
    templatePath,
    foundTags: [],
    unknownTags: [],
    missingTopLevel: [],
    missingLoop: [],
    hasBookListLoop: false,
    errors: [],
    warnings: [],
  };

  // 1. Extract tags
  const tags = extractTemplateTags(templateBuffer);
  result.foundTags = tags;

  // 2. Check for unknown tags
  for (const tag of tags) {
    if (!KNOWN_TAGS.has(tag)) {
      result.unknownTags.push(tag);

      // Fuzzy match: suggest closest known tag
      const suggestion = findClosestTag(tag);
      // Pass tag/suggestion brace-wrapped — the t() interpolation produces
      // literal {book_list}-style output in the user-facing message.
      if (suggestion) {
        result.errors.push(
          t("reminderApi.errUnknownTagWithSuggestion", {
            tag: `{${tag}}`,
            suggestion: `{${suggestion}}`,
          }),
        );
      } else {
        result.errors.push(
          t("reminderApi.errUnknownTagNoSuggestion", { tag: `{${tag}}` }),
        );
      }
    }
  }

  // 3. Check loop markers
  const hasLoopStart = tags.includes(`#${LOOP_NAME}`);
  const hasLoopEnd = tags.includes(`/${LOOP_NAME}`);
  result.hasBookListLoop = hasLoopStart && hasLoopEnd;

  const loopStart = `{#${LOOP_NAME}}`;
  const loopEnd = `{/${LOOP_NAME}}`;

  if (hasLoopStart && !hasLoopEnd) {
    result.errors.push(
      t("reminderApi.errLoopOpenedNotClosed", { loopStart, loopEnd }),
    );
  }
  if (!hasLoopStart && hasLoopEnd) {
    result.errors.push(
      t("reminderApi.errLoopEndWithoutStart", { loopStart, loopEnd }),
    );
  }
  if (!hasLoopStart && !hasLoopEnd) {
    result.warnings.push(
      t("reminderApi.warnNoBookListLoop", { loopStart, loopEnd }),
    );
  }

  // 4. Check for missing top-level placeholders (informational)
  for (const placeholder of TOP_LEVEL_PLACEHOLDERS) {
    if (!tags.includes(placeholder)) {
      result.missingTopLevel.push(placeholder);
      result.warnings.push(
        t("reminderApi.warnPlaceholderUnused", {
          placeholder: `{${placeholder}}`,
        }),
      );
    }
  }

  // 5. Check for missing loop placeholders (only if loop exists)
  if (result.hasBookListLoop) {
    for (const placeholder of LOOP_PLACEHOLDERS) {
      if (!tags.includes(placeholder)) {
        result.missingLoop.push(placeholder);
      }
    }
  }

  // 6. Dry run with sample data
  // Sample data is internal — never user-visible — so it stays German.
  // It's just used to verify that docxtemplater can render the template
  // without throwing; the rendered buffer is discarded.
  try {
    const sampleData: ReminderData = {
      school_name: "Musterschule",
      responsible_name: "Frau Muster",
      responsible_contact_email: "test@schule.de",
      firstName: "Max",
      lastName: "Mustermann",
      overdue_username: "Max Mustermann",
      schoolGrade: "3a",
      reminder_min_count: 5,
      today_date: dayjs().format("DD.MM.YYYY"),
      book_list: [
        {
          title: "Testbuch",
          author: "Testautor",
          rentedDate: "01.01.2026",
          bookId: 1,
        },
      ],
    };
    renderSingleLetter(templateBuffer, sampleData);
  } catch (err) {
    result.errors.push(
      t("reminderApi.errDryRunFailed", {
        error: err instanceof Error ? err.message : String(err),
      }),
    );
  }

  result.valid = result.errors.length === 0;
  return result;
}

/**
 * Simple Levenshtein-based closest-match suggestion for mistyped placeholders.
 */
function findClosestTag(input: string): string | null {
  // Strip loop markers for comparison
  const cleanInput = input.replace(/^[#/]/, "");
  let bestMatch: string | null = null;
  let bestDistance = Infinity;

  for (const known of KNOWN_TAGS) {
    const cleanKnown = known.replace(/^[#/]/, "");
    const dist = levenshtein(
      cleanInput.toLowerCase(),
      cleanKnown.toLowerCase(),
    );
    // Only suggest if reasonably close (less than half the tag length)
    if (dist < bestDistance && dist <= Math.ceil(cleanKnown.length / 2)) {
      bestDistance = dist;
      bestMatch = known;
    }
  }
  return bestMatch;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0),
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// =============================================================================
// Document rendering — single letter
//
// The template is a single-letter document (no outer loop). We render it
// once per user using docxtemplater, then merge the results at the XML level.
//
// This avoids docxtemplater's paragraphLoop issues with tables — rendering
// separately and merging is more robust than a single-pass loop over a
// document containing <w:tbl> elements.
// =============================================================================
function renderSingleLetter(
  templateBuffer: Buffer,
  data: ReminderData,
): Buffer {
  const zip = new PizZip(templateBuffer);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: Record<string, any> = {
    paragraphLoop: true,
    linebreaks: true,
  };
  if (angularParser) {
    options.parser = angularParser;
  }

  const doc = new Docxtemplater(zip, options);
  doc.render(data);

  const outputZip = doc.getZip();

  // Strip bare directory entries — Word rejects docx files that contain them
  for (const key of Object.keys(outputZip.files)) {
    if (outputZip.files[key].dir) {
      delete outputZip.files[key];
    }
  }

  return outputZip.generate({
    type: "nodebuffer",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    compression: "DEFLATE",
  });
}

// =============================================================================
// Document merging — combine rendered letters with page breaks
//
// Each letter is a complete docx. We extract the body content from each,
// concatenate them with page breaks between, and use the first letter's
// document.xml as the chrome (header, footer, styles, sectPr).
// =============================================================================
function mergeDocxBuffers(buffers: Buffer[]): Buffer {
  if (buffers.length === 0) {
    throw new Error("Cannot merge empty buffer list");
  }
  if (buffers.length === 1) {
    return buffers[0];
  }

  // Use the first letter as the host document
  const hostZip = new PizZip(buffers[0]);
  const hostDocXml = hostZip.file("word/document.xml")?.asText();
  if (!hostDocXml) {
    throw new Error("Host document.xml not found");
  }

  // Extract <w:body> content (everything between <w:body> and </w:body>,
  // excluding any body-level <w:sectPr> which is the page settings)
  const extractBody = (xml: string): string => {
    const bodyMatch = xml.match(/<w:body[^>]*>([\s\S]*?)<\/w:body>/);
    if (!bodyMatch) return "";
    let body = bodyMatch[1];
    // Strip body-level (final) <w:sectPr> only — not paragraph-level ones,
    // which would mangle in-document section breaks.
    body = body.replace(/<w:sectPr[^>]*>[\s\S]*?<\/w:sectPr>\s*$/, "");
    return body;
  };

  const PAGE_BREAK =
    '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';

  const bodyParts: string[] = [extractBody(hostDocXml)];

  for (let i = 1; i < buffers.length; i++) {
    const zip = new PizZip(buffers[i]);
    const xml = zip.file("word/document.xml")?.asText();
    if (!xml) continue;
    bodyParts.push(PAGE_BREAK);
    bodyParts.push(extractBody(xml));
  }

  // Reassemble: keep the host's <w:body>...</w:body> wrapper but with merged content
  const mergedXml = hostDocXml.replace(
    /<w:body[^>]*>[\s\S]*?<\/w:body>/,
    (match) => {
      const openTag = match.match(/<w:body[^>]*>/)?.[0] ?? "<w:body>";
      // Recover the body-level sectPr (page settings) we stripped
      const sectPrMatch = match.match(
        /<w:sectPr[^>]*>[\s\S]*?<\/w:sectPr>\s*<\/w:body>/,
      );
      const sectPr = sectPrMatch ? sectPrMatch[0].replace("</w:body>", "") : "";
      return openTag + bodyParts.join("") + sectPr + "</w:body>";
    },
  );

  hostZip.file("word/document.xml", mergedXml);

  return hostZip.generate({
    type: "nodebuffer",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    compression: "DEFLATE",
  });
}

// =============================================================================
// Build reminder data per user (groups multiple overdue books per user)
// =============================================================================
function buildReminderData(records: RentalRecord[]): ReminderData[] {
  // Group by user ID
  const byUser = new Map<number, RentalRecord[]>();
  for (const record of records) {
    if (!record.user) continue;
    const userId = record.user.id;
    const existing = byUser.get(userId);
    if (existing) {
      existing.push(record);
    } else {
      byUser.set(userId, [record]);
    }
  }

  const reminders: ReminderData[] = [];

  for (const [, userRecords] of byUser) {
    const user = userRecords[0].user!;
    reminders.push({
      school_name: SCHOOL_NAME,
      responsible_name: REMINDER_RESPONSIBLE_NAME,
      responsible_contact_email: REMINDER_RESPONSIBLE_EMAIL,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      overdue_username: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
      schoolGrade: user.schoolGrade ?? "",
      reminder_min_count: REMINDER_RENEWAL_COUNT,
      today_date: dayjs().format("DD.MM.YYYY"),
      book_list: userRecords.map((r) => ({
        title: r.title ?? "",
        author: r.author ?? "",
        rentedDate: dayjs(r.rentedDate).format("DD.MM.YYYY"),
        bookId: r.id,
      })),
    });
  }

  return reminders;
}

/**
 * Renders all reminder letters and returns the merged docx buffer.
 */
function generateDocument(
  templateBuffer: Buffer,
  reminders: ReminderData[],
): Buffer {
  const renderedBuffers: Buffer[] = [];

  for (const data of reminders) {
    renderedBuffers.push(renderSingleLetter(templateBuffer, data));
  }

  return mergeDocxBuffers(renderedBuffers);
}

// =============================================================================
// API Handler
//
// GET  — backward-compatible: generate for all overdue books
//        ?mode=all              (default) all overdue books
//        ?mode=non-extendable   only books exceeding REMINDER_RENEWAL_COUNT
//        ?action=validate       validate the current template
//
// POST — selective: generate for specific book IDs
//        body: { bookIds: number[] }
// =============================================================================
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    return handlePost(req, res);
  }
  if (req.method === "GET") {
    return handleGet(req, res);
  }

  res.status(405).end(`${req.method} Not Allowed`);
}

// =============================================================================
// POST handler — selective generation
// =============================================================================
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  businessLogger.info(
    { event: LogEvents.REMINDER_GENERATE, method: "POST" },
    "Generating reminder letters (selective)",
  );

  // Parse body
  const body = req.body as ReminderPostBody | undefined;
  if (
    !body?.bookIds ||
    !Array.isArray(body.bookIds) ||
    body.bookIds.length === 0
  ) {
    return res.status(400).json({
      error: t("reminderApi.errBodyMustContainBookIds"),
    });
  }

  // Validate all IDs are numbers
  const bookIds = body.bookIds.filter(
    (id): id is number => typeof id === "number" && Number.isFinite(id),
  );
  if (bookIds.length === 0) {
    return res.status(400).json({
      error: t("reminderApi.errNoValidNumericBookIds"),
    });
  }

  // Load and validate template
  let templateBuffer: Buffer;
  let templatePath: string;
  try {
    const loaded = loadTemplate();
    templateBuffer = loaded.buffer;
    templatePath = loaded.path;
  } catch (err) {
    errorLogger.error(
      {
        event: LogEvents.REMINDER_TEMPLATE_NOT_FOUND,
        file: REMINDER_TEMPLATE_DOC,
        error: err instanceof Error ? err.message : String(err),
      },
      "Reminder template not found",
    );
    return res.status(500).json({
      error: t("reminderApi.errTemplateNotFoundWithHint", {
        file: REMINDER_TEMPLATE_DOC,
      }),
    });
  }

  // Quick validation (check for unknown tags)
  const validation = validateTemplate(templateBuffer, templatePath);
  if (!validation.valid) {
    return res.status(422).json({
      error: t("reminderApi.errTemplateValidationFailed"),
      validation,
    });
  }

  // Fetch selected books from database
  try {
    const books = await prisma.book.findMany({
      where: { id: { in: bookIds } },
      select: {
        id: true,
        title: true,
        author: true,
        rentedDate: true,
        dueDate: true,
        renewalCount: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            schoolGrade: true,
          },
        },
      },
    });

    if (books.length === 0) {
      return res.status(404).json({
        error: t("reminderApi.errBooksNotFound"),
        requestedIds: bookIds,
      });
    }

    // Warn about IDs not found
    const foundIds = new Set(books.map((b) => b.id));
    const missingIds = bookIds.filter((id) => !foundIds.has(id));

    const reminders = buildReminderData(books as RentalRecord[]);

    if (reminders.length === 0) {
      return res.status(200).json({
        data: t("reminderApi.statusNoUsersAssigned"),
        reminderCount: 0,
      });
    }

    const generatedDoc = generateDocument(templateBuffer, reminders);
    const totalBooks = reminders.reduce(
      (sum, r) => sum + r.book_list.length,
      0,
    );

    businessLogger.info(
      {
        event: LogEvents.REPORT_MAHNUNGEN_GENERATED,
        letterCount: reminders.length,
        bookCount: totalBooks,
        missingIds: missingIds.length > 0 ? missingIds : undefined,
        templatePath,
      },
      `Generated ${reminders.length} reminder letters for ${totalBooks} books`,
    );

    sendDocx(res, generatedDoc, "mahnungen-auswahl");
  } catch (err) {
    errorLogger.error(
      {
        event: LogEvents.REMINDER_GENERATE,
        error: err instanceof Error ? err.message : String(err),
      },
      "Error generating selective reminders",
    );
    return res.status(500).json({
      error: t("reminderApi.errGenerationFailed"),
      details: err instanceof Error ? err.message : String(err),
    });
  }
}

// =============================================================================
// GET handler — backward-compatible bulk generation + template validation
// =============================================================================
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  // Validation action
  if (req.query.action === "validate") {
    return handleValidate(res);
  }

  const mode: ReminderMode =
    req.query.mode === "non-extendable" ? "non-extendable" : "all";

  businessLogger.info(
    { event: LogEvents.REMINDER_GENERATE, method: "GET", mode },
    `Generating reminder letters (mode=${mode})`,
  );

  // Load template
  let templateBuffer: Buffer;
  let templatePath: string;
  try {
    const loaded = loadTemplate();
    templateBuffer = loaded.buffer;
    templatePath = loaded.path;
  } catch (err) {
    errorLogger.error(
      {
        event: LogEvents.REMINDER_TEMPLATE_NOT_FOUND,
        file: REMINDER_TEMPLATE_DOC,
        error: err instanceof Error ? err.message : String(err),
      },
      "Reminder template not found",
    );
    return res.status(500).json({
      error: t("reminderApi.errTemplateNotFoundWithHint", {
        file: REMINDER_TEMPLATE_DOC,
      }),
    });
  }

  // Validate template
  const validation = validateTemplate(templateBuffer, templatePath);
  if (!validation.valid) {
    return res.status(422).json({
      error: t("reminderApi.errTemplateValidationFailed"),
      validation,
    });
  }

  try {
    const allRentals = await getRentedBooksWithUsers(prisma);

    if (!allRentals || allRentals.length === 0) {
      return res.status(200).json({
        data: t("reminderApi.statusNoRentedBooks"),
        reminderCount: 0,
      });
    }

    // Map and filter overdue rentals
    const today = dayjs();
    const overdueRecords: RentalRecord[] = [];

    for (const r of allRentals) {
      const due = dayjs(r.dueDate);
      const daysOverdue = today.diff(due, "days");

      if (daysOverdue <= 0) continue; // Not overdue

      if (
        mode === "non-extendable" &&
        r.renewalCount < REMINDER_RENEWAL_COUNT
      ) {
        continue; // Below renewal threshold
      }

      overdueRecords.push({
        id: r.id,
        title: r.title,
        author: r.author,
        rentedDate: r.rentedDate,
        dueDate: r.dueDate,
        renewalCount: r.renewalCount,
        user: r.user
          ? {
              id: r.user.id,
              firstName: r.user.firstName ?? "",
              lastName: r.user.lastName ?? "",
              schoolGrade: r.user.schoolGrade ?? "",
            }
          : null,
      });
    }

    if (overdueRecords.length === 0) {
      return res.status(200).json({
        data:
          mode === "non-extendable"
            ? t("reminderApi.statusNoOverdueBooksNonExtendable")
            : t("reminderApi.statusNoOverdueBooksAll"),
        reminderCount: 0,
      });
    }

    const reminders = buildReminderData(overdueRecords);
    const generatedDoc = generateDocument(templateBuffer, reminders);

    const totalBooks = reminders.reduce(
      (sum, r) => sum + r.book_list.length,
      0,
    );
    // Filename slug stays German — wire-protocol filename, not a UI string
    const modeLabel =
      mode === "non-extendable" ? "nicht-verlaengerbar" : "alle";

    businessLogger.info(
      {
        event: LogEvents.REPORT_MAHNUNGEN_GENERATED,
        mode,
        letterCount: reminders.length,
        bookCount: totalBooks,
        templatePath,
      },
      `Generated ${reminders.length} reminder letters (mode=${mode})`,
    );

    sendDocx(res, generatedDoc, `mahnungen-${modeLabel}`);
  } catch (err) {
    errorLogger.error(
      {
        event: LogEvents.REMINDER_GENERATE,
        error: err instanceof Error ? err.message : String(err),
      },
      "Error generating reminders",
    );
    return res.status(500).json({
      error: t("reminderApi.errGenerationFailed"),
      details: err instanceof Error ? err.message : String(err),
    });
  }
}

// =============================================================================
// Validate action — returns template health status as JSON
// =============================================================================
function handleValidate(res: NextApiResponse) {
  let templateBuffer: Buffer;
  let templatePath: string;
  try {
    const loaded = loadTemplate();
    templateBuffer = loaded.buffer;
    templatePath = loaded.path;
  } catch (err) {
    return res.status(404).json({
      valid: false,
      error: t("reminderApi.errTemplateNotFound", {
        file: REMINDER_TEMPLATE_DOC,
      }),
      details: err instanceof Error ? err.message : String(err),
    });
  }

  const validation = validateTemplate(templateBuffer, templatePath);
  return res.status(validation.valid ? 200 : 422).json(validation);
}

// =============================================================================
// Response helper
// =============================================================================
function sendDocx(
  res: NextApiResponse,
  buffer: Buffer,
  filenamePrefix: string,
) {
  const filename = `${filenamePrefix}-${dayjs().format("YYYY-MM-DD")}.docx`;

  res.writeHead(200, {
    "Content-Type":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Content-Length": buffer.length,
  });
  res.end(buffer);
}
