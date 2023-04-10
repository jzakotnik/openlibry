import { PrismaClient, Prisma } from "@prisma/client";
import { BookType } from "@/entities/BookType";
import dayjs from "dayjs";

export async function getBook(client: PrismaClient, id: number) {
  return await client.book.findUnique({ where: { id } });
}

export async function getAllBooks(client: PrismaClient) {
  try {
    return await client.book.findMany({});
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      console.log("ERROR in getting all Books: ", e);
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
      console.log("ERROR in counting books: ", e);
    }
    throw e;
  }
}

export async function addBook(client: PrismaClient, book: BookType) {
  console.log("Adding book", book);
  try {
    return await client.book.create({
      data: { ...book },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      console.log("ERROR in creating a new book: ", e);
    }
    throw e;
  }
}

export async function updateBook(
  client: PrismaClient,
  id: number,
  book: BookType
) {
  try {
    return await client.book.update({
      where: {
        id,
      },
      data: { ...book },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      console.log("ERROR in updating a book: ", e);
    }
    throw e;
  }
}

export async function deleteBook(client: PrismaClient, id: number) {
  try {
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
      console.log("ERROR in deleting one book: ", e);
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
      console.log("ERROR in deleting all books: ", e);
    }
    throw e;
  }
}

export async function extendBook(
  client: PrismaClient,
  bookid: number,
  days: number
) {
  //to extend a book, count the renewal counter and updated the due date
  try {
    const book = await getBook(client, bookid);
    if (!book?.dueDate) return; //you can't extend a book without a due date
    const updatedDueDate = dayjs(book?.dueDate).add(days, "day").toISOString();
    client.book.update({
      where: { id: bookid },
      data: { renewalCount: { increment: 1 }, dueDate: updatedDueDate },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      console.log("ERROR in extending a book: ", e);
    }
    throw e;
  }
}

export async function returnBook(client: PrismaClient, bookid: number) {
  try {
    return await client.book.update({
      where: { id: bookid },
      data: { renewalCount: 0, rentalStatus: "available" },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      console.log("ERROR in returning a book: ", e);
    }
    throw e;
  }
}

export async function hasRentedBook(
  client: PrismaClient,
  bookid: number,
  userid: number
) {
  try {
    const book = await client.book.findFirst({ where: { id: bookid } });
    console.log("Rent check for ", userid, bookid, book);
    if (book?.userId == userid && book.rentalStatus == "rented") return true;
    else return false;
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      console.log("ERROR in getting status of a book: ", e);
    }
    throw e;
  }
}

export async function rentBook(
  client: PrismaClient,
  userid: number,
  bookid: number,
  duration: number = 14
) {
  //change due date, connect to user
  //put all into one transaction

  //if the book is rented already, you cannot rent it
  try {
    const book = await getBook(client, bookid);
    if (book?.rentalStatus == "rented") {
      console.log("ERROR in renting a book: It is rented already");
      return "ERROR, book is rented";
    }
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      console.log("ERROR in renting a book: ", e);
    }
    throw e;
  }

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
    })
  );
  transaction.push(
    client.book.update({
      where: { id: bookid },
      data: { rentalStatus: "rented", renewalCount: 0 },
    })
  );
  const nowDate = dayjs().add(duration, "day");
  transaction.push(
    client.book.update({
      where: { id: bookid },
      data: { dueDate: nowDate.toISOString() },
    })
  );
  try {
    return await client.$transaction(transaction);
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      console.log("ERROR in renting a book: ", e);
    }
    throw e;
  }
}
