import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import { getAllBooks } from "@/entities/book";
import { getAllUsers } from "@/entities/user";
import { convertDateToDayString } from "@/utils/dateutils";
import { xlsbookcolumns, xlsusercolumns } from "@/utils/xlsColumnsMapping";
import { PrismaClient } from "@prisma/client";
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

        const workbook = new Excel.Workbook();
        const booksheet = workbook.addWorksheet("Bücherliste");
        const usersheet = workbook.addWorksheet("Userliste");

        booksheet.columns = xlsbookcolumns;

        books.map((b: BookType) => {
          booksheet.addRow(b);
        });

        usersheet.columns = xlsusercolumns;

        users.map((u: UserType) => {
          usersheet.addRow(u);
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
    case "POST":
      try {
        const bookData = req.body.bookData.slice(1); //remove top header row of excel
        const userData = req.body.userData.slice(1);

        console.log(
          "Received import xls, it contains so many books and users: ",
          bookData.length,
          userData.length
        );
        console.log("Example: ", bookData.slice(0, 5), userData.slice(0, 5));

        res.status(200).json({ result: "Imported dataset" });
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
