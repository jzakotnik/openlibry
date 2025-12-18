// pages/api/report/reminder.ts
import { getRentedBooksWithUsers } from "@/entities/book";
import { prisma } from "@/entities/db";
import dayjs from "dayjs";
import Docxtemplater from "docxtemplater";
import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import { join } from "path";
import PizZip from "pizzip";

// Configuration with proper typing
const config = {
  schoolName: process.env.SCHOOL_NAME || "Schule",
  responsibleName: process.env.REMINDER_RESPONSIBLE_NAME || "Schulbücherei",
  responsibleEmail: process.env.REMINDER_RESPONSIBLE_EMAIL || "info@email.de",
  renewalCount: parseInt(process.env.REMINDER_RENEWAL_COUNT || "5", 10),
  templatePath: process.env.REMINDER_TEMPLATE_DOC || "mahnung-template.docx",
} as const;

// Types
interface RentalWithUser {
  id: number;
  title: string;
  author: string;
  rentedDate: Date;
  dueDate: Date;
  lastName?: string;
  firstName?: string;
  remainingDays: number;
  renewalCount: number;
  userid?: number;
  schoolGrade?: string;
  price?: string;
}

interface BookEntry {
  title: string;
  author: string;
  rentedDate: string;
  dueDate: string;
  bookId: number;
}

interface MahnungEntry {
  school_name: string;
  responsible_name: string;
  responsible_contact_email: string;
  overdue_username: string;
  schoolGrade: string;
  book_list: BookEntry[];
  reminder_min_count: number;
}

// Lazy template loading with caching
let cachedTemplate: Buffer | null = null;

function getTemplate(): Buffer {
  if (!cachedTemplate) {
    const fullPath = join(process.cwd(), "public", config.templatePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Template not found: ${fullPath}`);
    }
    cachedTemplate = fs.readFileSync(fullPath);
  }
  return cachedTemplate;
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: `${req.method} Not Allowed` });
  }

  try {
    const allRentals = await getRentedBooksWithUsers(prisma);

    if (!allRentals || allRentals.length === 0) {
      return res.status(404).json({ error: "No rentals found" });
    }

    // Transform rentals with calculated fields
    const rentals: RentalWithUser[] = allRentals.map((r: any) => {
      const due = dayjs(r.dueDate);
      const today = dayjs();
      return {
        id: r.id,
        title: r.title,
        author: r.author,
        rentedDate: r.rentedDate,
        dueDate: r.dueDate,
        lastName: r.user?.lastName,
        firstName: r.user?.firstName,
        remainingDays: today.diff(due, "days"),
        renewalCount: r.renewalCount,
        userid: r.user?.id,
        schoolGrade: r.user?.schoolGrade,
        price: r.price,
      };
    });

    // Filter overdue books meeting criteria
    const overdueRentals = rentals.filter(
      (r) => r.renewalCount >= config.renewalCount && r.remainingDays > 0
    );

    if (overdueRentals.length === 0) {
      return res.status(200).json({
        message: "No overdue books matching reminder criteria",
        criteria: { minRenewalCount: config.renewalCount },
      });
    }

    // Group by user
    const rentalsByUser = overdueRentals.reduce<
      Record<number, RentalWithUser[]>
    >((acc, rental) => {
      const userId = rental.userid;
      if (userId === undefined) return acc;

      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(rental);
      return acc;
    }, {});

    // Build template data
    const mahnungen: MahnungEntry[] = [];

    for (const [userId, books] of Object.entries(rentalsByUser)) {
      const firstBook = books[0];

      mahnungen.push({
        school_name: config.schoolName,
        responsible_name: config.responsibleName,
        responsible_contact_email: config.responsibleEmail,
        overdue_username: `${firstBook.firstName || ""} ${
          firstBook.lastName || ""
        }`.trim(),
        schoolGrade: firstBook.schoolGrade || "",
        reminder_min_count: config.renewalCount,
        book_list: books.map((b) => ({
          title: b.title,
          author: b.author,
          rentedDate: dayjs(b.rentedDate).format("DD.MM.YYYY"),
          dueDate: dayjs(b.dueDate).format("DD.MM.YYYY"),
          bookId: b.id,
        })),
      });
    }

    // Generate document
    const template = getTemplate();
    const zip = new PizZip(template);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.render({ alleMahnungen: mahnungen });

    const generatedDoc = doc.getZip().generate({
      type: "nodebuffer",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      compression: "DEFLATE",
    });

    // Send response with proper headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="mahnungen-${dayjs().format("YYYY-MM-DD")}.docx"`
    );

    return res.status(200).send(generatedDoc);
  } catch (error) {
    console.error("Reminder generation failed:", error);
    return res.status(500).json({
      error: "Failed to generate reminder document",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
