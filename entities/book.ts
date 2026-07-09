import { BookType } from "@/entities/BookType";
import { getRentalConfig } from "@/lib/config/rentalConfig";
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";
import { cleanIsbn } from "@/lib/utils/isbn";
import { Prisma, PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import fs from "fs/promises";
import path from "path";
import { addAudit } from "./audit";
import { PublicBookType } from "./PublicBookType";
import { getUser } from "./user";

const rentalConfig = getRentalConfig();

/**
 * Store ISBNs in a single canonical form (digits + X, no hyphens/spaces) so
 * lookups that match on equivalent ISBN variants (e.g. same-book tag reuse)
 * find a copy regardless of how its ISBN was typed. Leaves a missing or
 * non-ISBN value untouched.
 */
export function normalizeIsbn<T extends { isbn?: string | null }>(book: T): T {
  if (typeof book.isbn !== "string" || !book.isbn.trim()) return book;
  const cleaned = cleanIsbn(book.isbn);
  return cleaned ? { ...book, isbn: cleaned } : book;
}
export async function getBook(client: PrismaClient, id: number) {
  return await client.book.findUnique({ where: { id } });
}

export async function getAllTopics(client: PrismaClient) {
  try {
    return await client.book.findMany({
      select: {
        topics: true,
      },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "getAllTopics",
          error: e instanceof Error ? e.message : String(e),
        },
        "Error getting all topics",
      );
    }
    throw e;
  }
}

export async function getAllBooks(client: PrismaClient) {
  try {
    return await client.book.findMany({
      orderBy: [
        {
          id: "desc",
        },
      ],
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "getAllBooks",
          error: e instanceof Error ? e.message : String(e),
        },
        "Error getting all books",
      );
    }
    throw e;
  }
}

export async function getPublicBooks(
  client: PrismaClient,
): Promise<PublicBookType[]> {
  try {
    const rawBooks = await client.book.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        isbn: true,
        topics: true,
        rentalStatus: true,
      },
      orderBy: { title: "asc" },
    });

    return rawBooks.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      isbn: b.isbn,
      topics: b.topics,
      rentalStatus: b.rentalStatus,
      // Cover is served by /api/images/[id]; auth-excluded in middleware.ts
      coverUrl: `/api/images/${b.id}`,
    }));
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "getPublicBooks",
          error: e instanceof Error ? e.message : String(e),
        },
        "Error getting public books",
      );
    }
    throw e;
  }
}

export async function getRentedBooksWithUsers(client: PrismaClient) {
  try {
    return await client.book.findMany({
      where: {
        rentalStatus: {
          contains: "rented",
        },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        author: true,
        renewalCount: true,
        rentedDate: true,
        user: {
          select: {
            lastName: true,
            firstName: true,
            schoolGrade: true,
            id: true,
          },
        },
      },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "getRentedBooksWithUsers",
          error: e instanceof Error ? e.message : String(e),
        },
        "Error getting rented books with users",
      );
    }
    throw e;
  }
}

export async function getRentedBooksForUser(client: PrismaClient, id: number) {
  try {
    return await client.book.findMany({
      where: {
        rentalStatus: {
          contains: "rented",
        },
        userId: {
          equals: id,
        },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        rentedDate: true,
        renewalCount: true,
        user: {
          select: {
            lastName: true,
            firstName: true,
            schoolGrade: true,
            id: true,
          },
        },
      },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "getRentedBooksForUser",
          userId: id,
          error: e instanceof Error ? e.message : String(e),
        },
        "Error getting rented books for user",
      );
    }
    throw e;
  }
}

export async function countBook(client: PrismaClient) {
  try {
    return await client.book.count({});
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "countBook",
          error: e instanceof Error ? e.message : String(e),
        },
        "Error counting books",
      );
    }
    throw e;
  }
}

export async function addBook(client: PrismaClient, book: BookType) {
  businessLogger.debug(
    {
      event: LogEvents.BOOK_CREATED,
      bookId: book.id,
      title: book.title,
    },
    "Adding book",
  );
  try {
    addAudit(client, "Add book", book.title, book.id);
    return await client.book.create({
      data: { ...normalizeIsbn(book) },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "addBook",
          bookId: book.id,
          title: book.title,
          error: e instanceof Error ? e.message : String(e),
        },
        "Error creating a new book",
      );
    }
    throw e;
  }
}

export async function updateBook(
  client: PrismaClient,
  id: number,
  book: BookType,
) {
  businessLogger.debug(
    {
      event: LogEvents.BOOK_UPDATED,
      bookId: id,
      title: book.title,
    },
    "Updating book",
  );
  const { id: _id, userId: _userId, ...bookData } = normalizeIsbn(book); //apparently in prisma 7, the id should not be included in the data itself
  try {
    await addAudit(
      client,
      "Update book",
      book.id ? book.id.toString() + ", " + book.title : "undefined",
      id,
    );

    const transaction: any[] = [];

    transaction.push(
      client.book.update({
        where: {
          id,
        },
        data: { ...bookData },
      }),
    );

    // Invariant: a book may only stay connected to a user while it's
    // actually "rented". If the status is being changed to anything else
    // (lost, broken, available, ...), sever the connection here too -
    // otherwise the book keeps a dangling userId and gets cascade-deleted
    // if that user is later removed, even though it's no longer their book.
    if (bookData.rentalStatus !== "rented") {
      const current = await client.book.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (current?.userId) {
        transaction.push(
          client.user.update({
            where: { id: current.userId },
            data: {
              books: {
                disconnect: { id },
              },
            },
          }),
        );

        await addAudit(
          client,
          "Update book - rental connection severed",
          `book id ${id}, ${book.title}, status changed to "${bookData.rentalStatus}", disconnected from user id ${current.userId}`,
          id,
          current.userId,
        );

        businessLogger.info(
          {
            event: LogEvents.BOOK_UPDATED,
            bookId: id,
            userId: current.userId,
            newRentalStatus: bookData.rentalStatus,
          },
          "Book status changed away from 'rented' - severed user connection",
        );
      }
    }

    const [updatedBook] = await client.$transaction(transaction);
    return updatedBook;
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "updateBook",
          bookId: id,
          title: book.title,
          error: e instanceof Error ? e.message : String(e),
        },
        "Error updating a book",
      );
    }
    throw e;
  }
}

export async function deleteBook(client: PrismaClient, id: number) {
  try {
    await addAudit(client, "Delete book", id.toString(), id);
    const deletedBook = await client.book.delete({
      where: {
        id,
      },
    });

    const storagePath = process.env.COVERIMAGE_FILESTORAGE_PATH;

    if (storagePath) {
      const fileName = `${id}.jpg`;
      const filePath = path.join(storagePath, fileName);

      try {
        // Löschversuch der .jpg Datei
        await fs.unlink(filePath);
      } catch (fileError: any) {
        // Falls die Datei gar nicht existiert, ignorieren.
        if (fileError.code !== "ENOENT") {
          errorLogger.warn(
            {
              bookId: id,
              error: fileError.message,
              path: filePath,
            },
            "Bilddatei konnte nicht gelöscht werden",
          );
        }
      }
    }
    return deletedBook;
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "deleteBook",
          bookId: id,
          error: e instanceof Error ? e.message : String(e),
        },
        "Error deleting one book",
      );
    }
    throw e;
  }
}

export async function deleteAllBooks(client: PrismaClient) {
  try {
    return await client.book.deleteMany({});
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "deleteAllBooks",
          error: e instanceof Error ? e.message : String(e),
        },
        "Error deleting all books",
      );
    }
    throw e;
  }
}

export async function extendBook(
  client: PrismaClient,
  bookid: number,
  days: number,
) {
  try {
    const book = await getBook(client, bookid);
    if (!book?.dueDate) return null; // you can't extend a book without a due date

    //
    // this was using the last due date instead of today
    // const updatedDueDate = dayjs(book.dueDate).add(days, "day").toISOString();
    const updatedDueDate = dayjs().add(days, "day").toISOString();
    const updatedBook = await client.book.update({
      where: { id: bookid },
      data: { renewalCount: { increment: 1 }, dueDate: updatedDueDate },
    });

    await addAudit(
      client,
      "Extend book",
      "book id " + bookid.toString() + ", " + book.title,
      bookid,
    );

    return updatedBook;
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "extendBook",
          bookId: bookid,
          error: e instanceof Error ? e.message : String(e),
        },
        "Error extending a book",
      );
    }
    throw e;
  }
}
export async function returnBook(client: PrismaClient, bookid: number) {
  try {
    //get the user for that book
    const book = (await getBook(client, bookid)) as BookType;
    if (!book.userId) {
      return "ERROR in returning a book, this user does not have a book";
    }
    const userid = book.userId;
    await addAudit(
      client,
      "Return book",
      "book id " + bookid.toString() + ", " + book.title,
      bookid,
    );
    const transaction = [];
    transaction.push(
      client.book.update({
        where: { id: bookid },
        data: {
          renewalCount: 0,
          rentalStatus: "available",
          dueDate: null,
          rentedDate: new Date().toISOString(),
        },
      }),
    );
    transaction.push(
      client.user.update({
        where: { id: userid },
        data: {
          books: {
            disconnect: { id: bookid },
          },
        },
      }),
    );

    return await client.$transaction(transaction);
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "returnBook",
          bookId: bookid,
          error: e instanceof Error ? e.message : String(e),
        },
        "Error returning a book",
      );
    }
    throw e;
  }
}

export async function hasRentedBook(
  client: PrismaClient,
  bookid: number,
  userid: number,
) {
  try {
    const book = await client.book.findFirst({ where: { id: bookid } });
    businessLogger.debug(
      {
        event: LogEvents.BOOK_RENTAL_CHECKED,
        userId: userid,
        bookId: bookid,
        rentalStatus: book?.rentalStatus,
        bookUserId: book?.userId,
      },
      "Rent check performed",
    );
    if (book?.userId == userid && book.rentalStatus == "rented") return true;
    else return false;
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "hasRentedBook",
          bookId: bookid,
          userId: userid,
          error: e instanceof Error ? e.message : String(e),
        },
        "Error getting status of a book",
      );
    }
    throw e;
  }
}

export async function rentBook(
  client: PrismaClient,
  userid: number,
  bookid: number,
  duration: number,
) {
  //console.log("Renting book with duration", duration);

  //if the book is rented already, you cannot rent it
  const book = await getBook(client, bookid);
  const user = await getUser(client, userid);

  try {
    if (book?.rentalStatus == "rented") {
      businessLogger.warn(
        {
          event: LogEvents.BOOK_RENTAL_REJECTED,
          bookId: bookid,
          userId: userid,
          reason: "Book already rented",
        },
        "Attempted to rent already rented book",
      );
      return "ERROR, book is rented";
    }
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "rentBook",
          bookId: bookid,
          userId: userid,
          error: e instanceof Error ? e.message : String(e),
        },
        "Error renting a book",
      );
    }
    throw e;
  }
  await addAudit(
    client,
    "Rent book",
    "User id: " +
      userid.toString() +
      " " +
      user?.firstName +
      " " +
      user?.lastName +
      ", Book id: " +
      bookid.toString() +
      ", book title: " +
      book?.title,
    bookid,
    userid,
  );
  const transaction = [];

  transaction.push(
    client.user.update({
      where: {
        id: userid,
      },
      data: {
        books: {
          connect: {
            id: bookid,
          },
        },
      },
    }),
  );
  const now = dayjs();
  const dueDate = now.add(duration, "day");
  transaction.push(
    client.book.update({
      where: { id: bookid },
      data: {
        rentalStatus: "rented",
        renewalCount: 0,
        rentedDate: now.toISOString(),
        dueDate: dueDate.toISOString(),
      },
    }),
  );
  try {
    return await client.$transaction(transaction);
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "rentBook",
          bookId: bookid,
          userId: userid,
          error: e instanceof Error ? e.message : String(e),
        },
        "Error renting a book",
      );
    }
    throw e;
  }
}
