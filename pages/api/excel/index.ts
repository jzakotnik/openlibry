import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import { getAllBooks, getRentedBooksWithUsers } from "@/entities/book";
import { getAllUsers } from "@/entities/user";
import { convertDateToDayString } from "@/utils/dateutils";
import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import Excel from "exceljs";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      try {
        const fileName = "openlibry_export.xlsx";

        const allUsers = await getAllUsers(prisma);

        const users = allUsers.map((u) => {
          const newUser = { ...u } as any; //define a better type there with conversion of Date to string
          newUser.createdAt = convertDateToDayString(u.createdAt);
          newUser.updatedAt = convertDateToDayString(u.updatedAt);
          return newUser;
        });

        const allBooks = await getAllBooks(prisma);
        const books = allBooks.map((b) => {
          const newBook = { ...b } as any; //define a better type there with conversion of Date to string
          newBook.createdAt = convertDateToDayString(b.createdAt);
          newBook.updatedAt = convertDateToDayString(b.updatedAt);
          newBook.rentedDate = b.rentedDate
            ? convertDateToDayString(b.rentedDate)
            : "";
          newBook.dueDate = b.dueDate ? convertDateToDayString(b.dueDate) : "";
          //temp TODO
          return newBook;
        });
        const allRentals = await getRentedBooksWithUsers(prisma);
        const rentals = allRentals.map((r) => {
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

        const workbook = new Excel.Workbook();
        const booksheet = workbook.addWorksheet("Bücherliste");
        const usersheet = workbook.addWorksheet("Userliste");
        const rentalsheet = workbook.addWorksheet("Leihen");

        booksheet.columns = [
          { key: "id", header: "Mediennummer" },
          { key: "title", header: "Titel" },
        ];

        books.map((b: BookType) => {
          booksheet.addRow(b);
        });

        usersheet.columns = [
          { key: "firstName", header: "Vorname" },
          { key: "lastName", header: "Nachname" },
        ];

        users.map((u: UserType) => {
          usersheet.addRow(u);
        });

        rentalsheet.columns = [
          { key: "title", header: "Titel" },
          { key: "lastName", header: "Nachname" },
        ];

        rentals.map((r: any) => {
          rentalsheet.addRow(r);
        });

        if (!books)
          return res.status(400).json({ data: "ERROR: Books not found" });
        res.writeHead(200, {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": "attachment; filename=" + fileName,
        });
        await workbook.xlsx.write(res);
        res.end();
      } catch (error) {
        console.log(error);
        res.status(400).json({ data: "ERROR: " + error });
      }
      break;

    default:
      res.status(405).end(`${req.method} Not Allowed`);
      break;
  }
}
