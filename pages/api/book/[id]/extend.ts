// pages/api/book/[id]/extend.ts
//
// POST /api/book/{id}/extend
//
// Extends the rental of a book by EXTENSION_DURATION_DAYS.
// The date is computed server-side so the client never needs to send it.
// Returns 409 { result: "already_extended" } if renewalCount >= MAX_EXTENSIONS.

import { extendBook, getBook } from "@/entities/book";
import { prisma } from "@/entities/db";
import { getRentalConfig } from "@/lib/config/rentalConfig";
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ result: `${req.method} Not Allowed` });
  }

  const id = parseInt(req.query.id as string);
  if (isNaN(id)) {
    return res.status(400).json({ result: "Invalid book ID" });
  }

  const { extensionDays, maxExtensions } = getRentalConfig();

  try {
    const book = await getBook(prisma, id);

    if (!book) {
      return res.status(404).json({ result: "Book not found" });
    }

    if (!book.dueDate) {
      return res
        .status(400)
        .json({ result: "Book has no due date – is it rented?" });
    }

    if ((book.renewalCount ?? 0) >= maxExtensions) {
      businessLogger.info(
        {
          event: LogEvents.BOOK_RENTAL_REJECTED,
          bookId: id,
          renewalCount: book.renewalCount,
          maxExtensions,
          reason: "Max extensions reached",
        },
        "Extend rejected – max renewals reached",
      );
      return res.status(409).json({ result: "already_extended" });
    }

    const updatedBook = await extendBook(prisma, id, extensionDays);
    if (!updatedBook) {
      return res
        .status(400)
        .json({ result: "Book has no due date – is it rented?" });
    }

    businessLogger.info(
      {
        event: LogEvents.BOOK_UPDATED,
        bookId: id,
        extensionDays,
        newRenewalCount: (book.renewalCount ?? 0) + 1,
      },
      "Book extended successfully",
    );
    return res.status(200).json({
      result: "ok",
      newDueDate: updatedBook.dueDate,
      renewalCount: updatedBook.renewalCount,
    });
  } catch (error) {
    errorLogger.error(
      {
        event: LogEvents.DB_ERROR,
        endpoint: "/api/book/[id]/extend",
        method: "POST",
        bookId: id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      "Failed to extend book",
    );
    return res.status(500).json({ result: "ERROR: " + error });
  }
}
