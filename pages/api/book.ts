import { BookType } from "@/entities/BookType";
import { addBook, getAllBooks, getCopyCountsByIsbn } from "@/entities/book";
import { prisma } from "@/entities/db";
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";
import { convertDateToDayString } from "@/lib/utils/dateutils";
import { Prisma } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  result: string;
};

type PagedBooks = {
  books: Array<BookType & { searchableTopics: string[]; copyCount?: number }>;
  total: number;
  page: number;
  pageSize: number;
};

const listBookSelect = {
  createdAt: true,
  updatedAt: true,
  id: true,
  rentalStatus: true,
  rentedDate: true,
  dueDate: true,
  renewalCount: true,
  title: true,
  subtitle: true,
  author: true,
  topics: true,
  isbn: true,
  userId: true,
} satisfies Prisma.BookSelect;

function getSingleQueryValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getPositiveInt(value: string | string[] | undefined): number | null {
  const parsed = parseInt(getSingleQueryValue(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getBookWhere(query: string): Prisma.BookWhereInput | undefined {
  const q = query.trim();
  if (!q) return undefined;

  const or: Prisma.BookWhereInput[] = [
    { title: { contains: q } },
    { author: { contains: q } },
    { subtitle: { contains: q } },
    { isbn: { contains: q } },
    { topics: { contains: q } },
  ];

  const numericId = parseInt(q.replace(/^0+/, "") || q, 10);
  if (/^\d+$/.test(q) && Number.isFinite(numericId)) {
    or.unshift({ id: numericId });
  }

  return { OR: or };
}

function toListBook(
  book: Prisma.BookGetPayload<{ select: typeof listBookSelect }>,
  copyCountsByIsbn: Map<string, number> = new Map(),
): BookType & { searchableTopics: string[]; copyCount?: number } {
  const isbn = book.isbn?.trim();

  return {
    ...book,
    createdAt: convertDateToDayString(book.createdAt) as any,
    updatedAt: convertDateToDayString(book.updatedAt) as any,
    rentedDate: book.rentedDate ? convertDateToDayString(book.rentedDate) : "",
    dueDate: book.dueDate ? convertDateToDayString(book.dueDate) : "",
    subtitle: book.subtitle ?? undefined,
    topics: book.topics ?? undefined,
    isbn: book.isbn ?? undefined,
    userId: book.userId ?? undefined,
    copyCount: isbn ? copyCountsByIsbn.get(isbn) : undefined,
    searchableTopics: book.topics ? book.topics.split(";") : [],
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | BookType | Array<BookType> | PagedBooks>,
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
        const pageSize = getPositiveInt(req.query.pageSize);
        const page = getPositiveInt(req.query.page) ?? 1;
        const q = getSingleQueryValue(req.query.q);

        if (pageSize) {
          const where = getBookWhere(q);
          const [rawBooks, total] = await Promise.all([
            prisma.book.findMany({
              select: listBookSelect,
              where,
              orderBy: [{ id: "desc" }],
              skip: (page - 1) * pageSize,
              take: pageSize,
            }),
            prisma.book.count({ where }),
          ]);
          const copyCountsByIsbn = await getCopyCountsByIsbn(
            prisma,
            rawBooks,
            where,
          );

          return res.status(200).json({
            books: rawBooks.map((book) => toListBook(book, copyCountsByIsbn)),
            total,
            page,
            pageSize,
          });
        }

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
