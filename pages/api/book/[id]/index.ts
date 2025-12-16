import { BookType } from "@/entities/BookType";
import { deleteBook, getBook, updateBook } from "@/entities/book";
import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/entities/db";
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.query.id) {
    errorLogger.warn(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/book/[id]",
        method: req.method,
        reason: "Missing book ID parameter",
      },
      "Book ID not provided"
    );
    return res.status(404).end(`${req.query} id not found`);
  }

  const id = parseInt(req.query.id as string);

  switch (req.method) {
    case "DELETE":
      try {
        const deleteResult = await deleteBook(prisma, id);

        businessLogger.info(
          {
            event: LogEvents.BOOK_DELETED,
            bookId: id,
          },
          "Book deleted successfully"
        );

        res.status(200).json(deleteResult);
      } catch (error) {
        errorLogger.error(
          {
            event: LogEvents.DB_ERROR,
            endpoint: "/api/book/[id]",
            method: "DELETE",
            bookId: id,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
          "Failed to delete book"
        );
        res.status(400).json({ data: "ERROR DELETE: " + error });
      }
      break;

    case "PUT":
      if (!req.body) {
        errorLogger.warn(
          {
            event: LogEvents.API_ERROR,
            endpoint: "/api/book/[id]",
            method: "PUT",
            bookId: id,
            reason: "No request body provided",
          },
          "Book update request missing body"
        );
        return res.status(400).json({ message: "Keine Daten übermittelt" });
      }

      const bookdata = req.body as BookType;

      businessLogger.debug(
        {
          event: LogEvents.BOOK_UPDATED,
          bookId: id,
          title: bookdata.title,
          fields: Object.keys(bookdata),
        },
        "Processing book update request"
      );

      try {
        const updateResult = await updateBook(prisma, id, bookdata);

        businessLogger.info(
          {
            event: LogEvents.BOOK_UPDATED,
            bookId: id,
            title: bookdata.title,
            isbn: bookdata.isbn,
          },
          "Book updated successfully"
        );

        res.status(200).json(updateResult);
      } catch (error) {
        errorLogger.error(
          {
            event: LogEvents.DB_ERROR,
            endpoint: "/api/book/[id]",
            method: "PUT",
            bookId: id,
            title: bookdata.title,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
          "Failed to update book"
        );
        res
          .status(400)
          .json({ message: "Fehler beim Speichern / Update: " + error });
      }
      break;

    case "GET":
      try {
        const book = (await getBook(prisma, id)) as BookType;
        if (!book) {
          businessLogger.warn(
            {
              event: LogEvents.API_ERROR,
              endpoint: "/api/book/[id]",
              method: "GET",
              bookId: id,
              reason: "Book not found",
            },
            "Requested book does not exist"
          );
          return res
            .status(400)
            .json({ data: "ERROR: Book with ID " + id + " not found" });
        }

        // Note: GET requests typically don't need info-level logging
        // as they generate too much noise. Use debug level if needed:
        // businessLogger.debug({ bookId: id }, 'Book retrieved');

        res.status(200).json(book);
      } catch (error) {
        errorLogger.error(
          {
            event: LogEvents.DB_ERROR,
            endpoint: "/api/book/[id]",
            method: "GET",
            bookId: id,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
          "Failed to retrieve book"
        );
        res.status(400).json({ data: "ERROR: " + error });
      }
      break;

    default:
      errorLogger.warn(
        {
          event: LogEvents.API_ERROR,
          endpoint: "/api/book/[id]",
          method: req.method,
          bookId: id,
          reason: "Method not allowed",
        },
        "Unsupported HTTP method"
      );
      res.status(405).end(`${req.method} Not Allowed`);
      break;
  }
}
