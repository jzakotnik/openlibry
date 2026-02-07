import { getRentedBooksWithUsers } from "@/entities/book";

import Docxtemplater from "docxtemplater";
import fs from "fs";
import PizZip from "pizzip";

import { resolveCustomPath } from "@/lib/utils/customPath";
import { convertDateToDayString } from "@/lib/utils/dateutils";
import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/entities/db";

// =============================================================================
// Default configuration values
// =============================================================================
const DEFAULT_SCHOOL_NAME = "Schule";
const DEFAULT_REMINDER_RESPONSIBLE_NAME = "Schulbücherei";
const DEFAULT_REMINDER_RESPONSIBLE_EMAIL = "buecherei@schule.de";
const DEFAULT_REMINDER_RENEWAL_COUNT = 5;
const DEFAULT_REMINDER_TEMPLATE_DOC = "mahnung-template.docx";

// =============================================================================
// Configuration loading with fallbacks
// =============================================================================
const SCHOOL_NAME = process.env.SCHOOL_NAME || DEFAULT_SCHOOL_NAME;
const REMINDER_RESPONSIBLE_NAME =
  process.env.REMINDER_RESPONSIBLE_NAME || DEFAULT_REMINDER_RESPONSIBLE_NAME;
const REMINDER_RESPONSIBLE_EMAIL =
  process.env.REMINDER_RESPONSIBLE_EMAIL || DEFAULT_REMINDER_RESPONSIBLE_EMAIL;
const REMINDER_RENEWAL_COUNT = process.env.REMINDER_RENEWAL_COUNT
  ? parseInt(process.env.REMINDER_RENEWAL_COUNT)
  : DEFAULT_REMINDER_RENEWAL_COUNT;
const REMINDER_TEMPLATE_DOC =
  process.env.REMINDER_TEMPLATE_DOC || DEFAULT_REMINDER_TEMPLATE_DOC;

// Load template with error handling
// Checks database/custom/ first, falls back to public/
let template: Buffer | null = null;
try {
  const templatePath = resolveCustomPath(REMINDER_TEMPLATE_DOC);
  template = fs.readFileSync(templatePath);
  console.log(`Reminder template loaded: ${templatePath}`);
} catch (error) {
  console.warn(
    `Warning: Could not load reminder template "${REMINDER_TEMPLATE_DOC}" ` +
      `in database/custom/ or public/. Reminder generation will not work until template is provided.`,
  );
}

// =============================================================================
// Type definitions
// =============================================================================
interface BookListItem {
  title: string;
  author: string;
  rentedDate: string;
}

interface ReminderEntry {
  school_name: string;
  responsible_name: string;
  responsible_contact_email: string;
  overdue_username: string;
  schoolGrade: string;
  book_list: BookListItem[];
  reminder_min_count: number;
}

interface ReplacementVariables {
  alleMahnungen: ReminderEntry[];
}

// =============================================================================
// API Handler
// =============================================================================
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET":
      console.log("Printing reminder letters via API");

      // Check if template is available
      if (!template) {
        return res.status(500).json({
          data:
            `ERROR: Reminder template not found. ` +
            `Please place "${REMINDER_TEMPLATE_DOC}" in database/custom/ or public/, ` +
            `or set REMINDER_TEMPLATE_DOC in your .env file.`,
        });
      }

      try {
        // Create fresh replacement variables for each request
        // (avoids concurrency issues with multiple clients)
        const replacementVariables: ReplacementVariables = {
          alleMahnungen: [],
        };

        // Get all rented books with user information
        const allRentals = await getRentedBooksWithUsers(prisma);

        if (!allRentals || allRentals.length === 0) {
          return res.status(200).json({
            data: "No rentals found",
            reminderCount: 0,
          });
        }

        // Calculate rental information
        const rentals = allRentals.map((r: any) => {
          const due = dayjs(r.dueDate);
          const today = dayjs();
          const diff = today.diff(due, "days");

          return {
            id: r.id,
            title: r.title,
            author: r.author,
            rentedDate: r.rentedDate,
            lastName: r.user?.lastName ?? "",
            firstName: r.user?.firstName ?? "",
            remainingDays: diff,
            dueDate: convertDateToDayString(due.toDate()),
            renewalCount: r.renewalCount,
            userid: r.user?.id,
            schoolGrade: r.user?.schoolGrade ?? "",
          };
        });

        // Filter for overdue rentals that exceed the renewal count threshold
        const overdueRentals = rentals.filter(
          (r) =>
            r.renewalCount >= REMINDER_RENEWAL_COUNT && r.remainingDays > 0,
        );

        if (overdueRentals.length === 0) {
          return res.status(200).json({
            data: "No overdue rentals found that require reminders",
            reminderCount: 0,
          });
        }

        // Cluster overdue books by user for the overdue notices
        const overDueRentalsByUser = overdueRentals.reduce(
          (acc: Record<string, any[]>, curr) => {
            const { userid, ...rest } = curr;
            if (userid) {
              acc[userid] ? acc[userid].push(rest) : (acc[userid] = [rest]);
            }
            return acc;
          },
          {},
        );

        console.log(
          "Overdue rentals by user:",
          Object.keys(overDueRentalsByUser).length,
          "users",
        );

        // Map overdue rentals to the docxtemplater template format
        Object.keys(overDueRentalsByUser).forEach((userID) => {
          const userBooks = overDueRentalsByUser[userID];
          const firstBook = userBooks[0];

          replacementVariables.alleMahnungen.push({
            school_name: SCHOOL_NAME,
            responsible_name: REMINDER_RESPONSIBLE_NAME,
            responsible_contact_email: REMINDER_RESPONSIBLE_EMAIL,
            overdue_username:
              `${firstBook.firstName} ${firstBook.lastName}`.trim(),
            schoolGrade: firstBook.schoolGrade,
            book_list: userBooks.map((b: any) => ({
              title: b.title,
              author: b.author,
              rentedDate: dayjs(b.rentedDate).format("DD.MM.YYYY"),
            })),
            reminder_min_count: REMINDER_RENEWAL_COUNT,
          });
        });

        console.log(
          "Generated reminders for",
          replacementVariables.alleMahnungen.length,
          "users",
        );

        // Generate the document
        try {
          const zip = new PizZip(template);
          const templateDoc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
          });

          templateDoc.render(replacementVariables);

          const generatedDoc = templateDoc.getZip().generate({
            type: "nodebuffer",
            mimeType:
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            compression: "DEFLATE",
          });

          console.log("Generated reminder document successfully");

          res.writeHead(200, {
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Content-Disposition": `attachment; filename="mahnungen-${dayjs().format("YYYY-MM-DD")}.docx"`,
          });

          res.end(generatedDoc);
        } catch (docError) {
          console.error("Error generating document:", docError);
          return res.status(500).json({
            data: "ERROR: Failed to generate reminder document. Check template format.",
            error: String(docError),
          });
        }
      } catch (error) {
        console.error("Error processing reminders:", error);
        res.status(400).json({ data: "ERROR: " + error });
      }
      break;

    default:
      res.status(405).end(`${req.method} Not Allowed`);
      break;
  }
}
