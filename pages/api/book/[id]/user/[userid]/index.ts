// pages/api/book/[id]/user/[userid]/index.ts
import { BookType } from "@/entities/BookType";
import { hasRentedBook, rentBook, returnBook } from "@/entities/book";
import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/entities/db";
import { getRentalConfig } from "@/lib/config/rentalConfig";
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";

type Data = {
  result: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | BookType | Array<BookType>>,
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
        "Rental request missing required parameters",
      );
      return res
        .status(400)
        .json({ result: "ERROR, rented book or user not specified" });
    }

    //const rentalDays = parseInt(process.env.RENTAL_DURATION_DAYS || "21", 10);
    const rentalDays = getRentalConfig().rentalDays;
    console.log("Rental config", getRentalConfig());

    try {
      const rental = await rentBook(prisma, userId, bookId, rentalDays);

      if (rental === "ERROR, book is rented") {
        businessLogger.warn(
          {
            event: LogEvents.BOOK_RENTAL_REJECTED,
            bookId,
            userId,
            reason: "Book already rented",
          },
          "Rental rejected - book not available",
        );
        return res.status(409).json({ result: rental });
      }

      businessLogger.info(
        {
          event: LogEvents.BOOK_RENTED,
          bookId,
          userId,
          rentalDays,
        },
        "Book rented successfully",
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
        "Failed to rent book",
      );
      res.status(500).json({ result: "ERROR: " + error });
    }
    return;
  }

  // Return a book
  if (req.method === "DELETE") {
    if (!bookId || !userId) {
      errorLogger.warn(
        {
          event: LogEvents.API_ERROR,
          endpoint: "/api/book/[id]/user/[userid]",
          method: "DELETE",
          bookId,
          userId,
          reason: "Missing book ID or user ID",
        },
        "Return request missing required parameters",
      );
      return res
        .status(400)
        .json({ result: "ERROR, book or user not specified" });
    }

    try {
      const hasRented = await hasRentedBook(prisma, bookId, userId);

      if (!hasRented) {
        businessLogger.warn(
          {
            event: LogEvents.BOOK_RENTAL_REJECTED,
            bookId,
            userId,
            reason: "User does not have this book rented",
          },
          "Return rejected - book not rented by this user",
        );
        return res
          .status(400)
          .json({ result: "ERROR, this user does not have this book" });
      }

      const result = await returnBook(prisma, bookId);

      businessLogger.info(
        {
          event: LogEvents.BOOK_RETURNED,
          bookId,
          userId,
        },
        "Book returned successfully",
      );

      res.status(200).json({ result: JSON.stringify(result) });
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
        "Failed to return book",
      );
      res.status(500).json({ result: "ERROR: " + error });
    }
    return;
  }

  res.status(405).json({ result: `${req.method} Not Allowed` });
}
