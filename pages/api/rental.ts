import { BookType } from "@/entities/BookType";
import { RentalsUserType } from "@/entities/RentalsUserType";
import { UserType } from "@/entities/UserType";
import { getAllBooks, getRentedBooksWithUsers } from "@/entities/book";
import { prisma } from "@/entities/db";
import { getAllUsers } from "@/entities/user";
import { LogEvents } from "@/lib/logEvents";
import { errorLogger } from "@/lib/logger";
import {
  calendarDaysDiff,
  formatCalendarDayString,
  formatInstantDayString,
  replaceUserDateString,
  todayDateString,
} from "@/lib/utils/dateutils";
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
      newBook.createdAt = formatInstantDayString(b.createdAt);
      newBook.updatedAt = formatInstantDayString(b.updatedAt);
      newBook.rentedDate = b.rentedDate
        ? formatCalendarDayString(b.rentedDate)
        : "";
      newBook.dueDate = b.dueDate ? formatCalendarDayString(b.dueDate) : "";
      return newBook;
    });

    //calculate the rental information
    const allRentals = await getRentedBooksWithUsers(prisma);
    const today = todayDateString();
    const rentals = allRentals.map((r: any) => {
      // Positive = overdue by that many whole calendar days (see the
      // remainingDays sign-convention note in lib/utils/rentalUtils.ts).
      const diff = calendarDaysDiff(today, r.dueDate);
      return {
        id: r.id,
        title: r.title,
        lastName: r.user?.lastName,
        firstName: r.user?.firstName,
        remainingDays: diff,
        dueDate: formatCalendarDayString(r.dueDate),
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
