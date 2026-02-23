import { BookType } from "@/entities/BookType";
import { getRentalConfig } from "@/lib/config/rentalConfig";
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";
import { Prisma, PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import { addAudit } from "./audit";
import { getUser } from "./user";

const rentalConfig = getRentalConfig();
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
      data: { ...book },
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
  const { id: _id, userId: _userId, ...bookData } = book; //apparently in prisma 7, the id should not be included in the data itself
  try {
    await addAudit(
      client,
      "Update book",
      book.id ? book.id.toString() + ", " + book.title : "undefined",
      id,
    );
    return await client.book.update({
      where: {
        id,
      },
      data: { ...bookData },
    });
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
    return await client.book.delete({
      where: {
        id,
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

    const updatedDueDate = dayjs(book.dueDate).add(days, "day").toISOString();

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
