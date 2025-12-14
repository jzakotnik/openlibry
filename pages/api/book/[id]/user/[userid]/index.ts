import { BookType } from "@/entities/BookType";
import { hasRentedBook, rentBook, returnBook } from "@/entities/book";
import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/entities/db";
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";

type Data = {
  result: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | BookType | Array<BookType>>
) {
  const bookId = req.query.id ? parseInt(req.query.id as string) : null;
  const userId = req.query.userid ? parseInt(req.query.userid as string) : null;

  // Rent a book
  if (req.method === "POST") {
    if (!bookId || !userId) {
      errorLogger.warn(
        {
          event: LogEvents.API_ERROR,
          endpoint: "/api/book/[id]/user/[userid]",
          method: "POST",
          bookId,
          userId,
          reason: "Missing book ID or user ID",
        },
        "Rental request missing required parameters"
      );
      return res
        .status(400)
        .json({ result: "ERROR, rented book or user not specified" });
    }

    try {
      const rental = await rentBook(prisma, userId, bookId);

      // Check if rental failed due to book already being rented
      if (rental === "ERROR, book is rented") {
        businessLogger.warn(
          {
            event: LogEvents.BOOK_RENTAL_REJECTED,
            bookId,
            userId,
            reason: "Book already rented",
          },
          "Rental rejected - book not available"
        );
        return res.status(409).json({ result: rental });
      }

      businessLogger.info(
        {
          event: LogEvents.BOOK_RENTED,
          bookId,
          userId,
        },
        "Book rented successfully"
      );

      res.status(200).json({ result: JSON.stringify(rental) });
    } catch (error) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          endpoint: "/api/book/[id]/user/[userid]",
          method: "POST",
          bookId,
          userId,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        "Failed to rent book"
      );
      res.status(400).json({ result: "ERROR: " + error });
    }
  }

  // Return a book
  if (req.method === "DELETE") {
    if (!bookId) {
      errorLogger.warn(
        {
          event: LogEvents.API_ERROR,
          endpoint: "/api/book/[id]/user/[userid]",
          method: "DELETE",
          bookId,
          reason: "Missing book ID",
        },
        "Return request missing book ID"
      );
      return res
        .status(400)
        .json({ result: "ERROR, rented book or user not specified" });
    }

    try {
      const rental = await returnBook(prisma, bookId);

      businessLogger.info(
        {
          event: LogEvents.BOOK_RETURNED,
          bookId,
          userId,
        },
        "Book returned successfully"
      );

      res.status(200).json({ result: JSON.stringify(rental) });
    } catch (error) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          endpoint: "/api/book/[id]/user/[userid]",
          method: "DELETE",
          bookId,
          userId,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        "Failed to return book"
      );
      res.status(400).json({ result: "ERROR: " + error });
    }
  }

  // Check rental status
  if (req.method === "GET") {
    if (!bookId || !userId) {
      errorLogger.warn(
        {
          event: LogEvents.API_ERROR,
          endpoint: "/api/book/[id]/user/[userid]",
          method: "GET",
          bookId,
          userId,
          reason: "Missing book ID or user ID",
        },
        "Rental status check missing required parameters"
      );
      return res
        .status(400)
        .json({ result: "ERROR, rented book not specified" });
    }

    try {
      const rental = await hasRentedBook(prisma, bookId, userId);

      // Debug level - checking status is frequent and not business-critical
      businessLogger.debug(
        {
          event: LogEvents.BOOK_RENTAL_CHECKED,
          bookId,
          userId,
          isRented: rental,
        },
        "Rental status checked"
      );

      res.status(200).json({ result: rental.toString() });
    } catch (error) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          endpoint: "/api/book/[id]/user/[userid]",
          method: "GET",
          bookId,
          userId,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        "Failed to check rental status"
      );
      res.status(400).json({ result: "ERROR: " + error });
    }
  }
}
