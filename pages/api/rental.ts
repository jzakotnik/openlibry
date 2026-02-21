import { BookType } from "@/entities/BookType";
import { RentalsUserType } from "@/entities/RentalsUserType";
import { UserType } from "@/entities/UserType";
import { getAllBooks, getRentedBooksWithUsers } from "@/entities/book";
import { prisma } from "@/entities/db";
import { getAllUsers } from "@/entities/user";
import { LogEvents } from "@/lib/logEvents";
import { errorLogger } from "@/lib/logger";
import {
  convertDateToDayString,
  replaceUserDateString,
} from "@/lib/utils/dateutils";
import dayjs from "dayjs";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  users: Array<UserType>;
  books: Array<BookType>;
  rentals: Array<RentalsUserType>;
};

type Error = {
  result: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | Error>,
) {
  if (req.method !== "GET") {
    return res.status(405).end(`${req.method} Not Allowed`);
  }

  try {
    //get all the users
    const users = await getAllUsers(prisma);
    const convertedUsers = users.map(replaceUserDateString);
    if (!users) {
      return res.status(400).json({ result: "ERROR: User not found" });
    }

    //get all the books
    const allBooks = await getAllBooks(prisma);
    const books = allBooks.map((b) => {
      const newBook = { ...b } as any; //define a better type there with conversion of Date to string
      newBook.createdAt = convertDateToDayString(b.createdAt);
      newBook.updatedAt = convertDateToDayString(b.updatedAt);
      newBook.rentedDate = b.rentedDate
        ? convertDateToDayString(b.rentedDate)
        : "";
      newBook.dueDate = b.dueDate ? convertDateToDayString(b.dueDate) : "";
      return newBook;
    });

    //calculate the rental information
    const allRentals = await getRentedBooksWithUsers(prisma);
    const rentals = allRentals.map((r: any) => {
      //calculate remaining days for the rental
      const due = dayjs(r.dueDate);
      const today = dayjs();
      const diff = today.diff(due, "days");
      return {
        id: r.id,
        title: r.title,
        lastName: r.user?.lastName,
        firstName: r.user?.firstName,
        remainingDays: diff,
        dueDate: convertDateToDayString(due.toDate()),
        renewalCount: r.renewalCount,
        userid: r.user?.id,
      };
    });

    res
      .status(200)
      .json({ users: convertedUsers, rentals: rentals, books: books });
  } catch (error) {
    errorLogger.error(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/rental",
        method: "GET",
        error: error instanceof Error ? error.message : String(error),
      },
      "Error fetching rental summary data",
    );
    res.status(400).json({ result: "ERROR: " + error });
  }
}
