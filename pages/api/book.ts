import { BookType } from "@/entities/BookType";
import { addBook, getAllBooks } from "@/entities/book";
import { prisma } from "@/entities/db";
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  result: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | BookType | Array<BookType>>
) {
  switch (req.method) {
    case "POST": {
      const book = req.body as BookType;
      try {
        const result = (await addBook(prisma, book)) as BookType;

        businessLogger.info(
          {
            event: LogEvents.BOOK_CREATED,
            bookId: result.id,
            title: result.title,
          },
          "Book created via API"
        );

        res.status(200).json(result);
      } catch (error) {
        errorLogger.error(
          {
            event: LogEvents.API_ERROR,
            endpoint: "/api/book",
            method: "POST",
            bookId: book.id,
            error: error instanceof Error ? error.message : String(error),
          },
          "Error creating book"
        );
        res.status(400).json({ result: "ERROR: " + error });
      }
      break;
    }

    case "GET": {
      try {
        const books = (await getAllBooks(prisma)) as Array<BookType>;
        if (!books) {
          return res.status(400).json({ result: "ERROR: Book not found" });
        }
        res.status(200).json(books);
      } catch (error) {
        errorLogger.error(
          {
            event: LogEvents.API_ERROR,
            endpoint: "/api/book",
            method: "GET",
            error: error instanceof Error ? error.message : String(error),
          },
          "Error getting all books"
        );
        res.status(400).json({ result: "ERROR: " + error });
      }
      break;
    }

    default:
      res.status(405).end(`${req.method} Not Allowed`);
  }
}
