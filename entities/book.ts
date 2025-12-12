import { BookType } from "@/entities/BookType";
import { Prisma, PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import { addAudit } from "./audit";

const extensionDays = parseInt(process.env.EXTENSION_DURATION_DAYS!) || 21;
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
      console.log("ERROR in getting all Books: ", e);
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
      console.log("ERROR in getting all Books: ", e);
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
      console.log("ERROR in getting all Books: ", e);
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
    addAudit(client, "Add book", book.title, book.id);
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
  console.log("Updating book with book", book);
  const { id: _id, userId: _userId, ...bookData } = book; //apparently in prisma 7, the id should not be included in the data itself
  try {
    await addAudit(
      client,
      "Update book",
      book.id ? book.id.toString() + ", " + book.title : "undefined",
      id
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
      console.log("ERROR in updating a book: ", e);
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
    await client.book.update({
      where: { id: bookid },
      data: { renewalCount: { increment: 1 }, dueDate: updatedDueDate },
    });
    await addAudit(
      client,
      "Extend book",
      "book id " + bookid.toString() + ", " + book.title,
      bookid
    );
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
    //get the user for that book
    const book = (await getBook(client, bookid)) as BookType;
    if (!book.userId) {
      console.log("ERROR in returning a book, this user does not have a book");
      return "ERROR in returning a book, this user does not have a book";
    }
    const userid = book.userId;
    await addAudit(
      client,
      "Return book",
      "book id " + bookid.toString() + ", " + book.title,
      bookid
    );
    const transaction = [];
    transaction.push(
      client.book.update({
        where: { id: bookid },
        data: {
          renewalCount: 0,
          rentalStatus: "available",
        },
      })
    );
    transaction.push(
      client.user.update({
        where: { id: userid },
        data: {
          books: {
            disconnect: { id: bookid },
          },
        },
      })
    );

    return await client.$transaction(transaction);
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
  duration: number = extensionDays
) {
  //change due date, connect to user
  //put all into one transaction

  //if the book is rented already, you cannot rent it
  const book = await getBook(client, bookid);
  try {
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
  await addAudit(
    client,
    "Rent book",
    "User id: " +
      userid.toString() +
      ", Book id: " +
      bookid.toString() +
      ", book title: " +
      book?.title,
    bookid,
    userid
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
