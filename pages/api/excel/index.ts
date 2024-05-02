import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import { getAllBooks } from "@/entities/book";
import { getAllUsers } from "@/entities/user";
import { convertDateToDayString } from "@/utils/dateutils";
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

        booksheet.columns = [
          { key: "id", header: "Mediennummer" },
          { key: "createdAt", header: "Erzeugt am" },
          { key: "updatedAt", header: "Update am" },
          { key: "rentalStatus", header: "Ausleihstatus" },
          { key: "rentedDate", header: "Ausgeliehen am" },
          { key: "dueDate", header: "Rückgabe am" },
          { key: "renewalCount", header: "Anzahl Verlängerungen" },
          { key: "title", header: "Titel" },
          { key: "subtitle", header: "Untertitel" },
          { key: "author", header: "Autor" },
          { key: "topics", header: "Schlagworte" },
          { key: "imageLink", header: "Bild" },
          { key: "isbn", header: "ISBN" },
          { key: "editionDescription", header: "Edition" },
          { key: "publisherLocation", header: "Verlagsort" },
          { key: "pages", header: "Seiten" },
          { key: "summary", header: "Zusammenfassung" },
          { key: "minPlayers", header: "Min Spieler" },
          { key: "publisherName", header: "Verlag" },
          { key: "otherPhysicalAttributes", header: "Merkmale" },
          { key: "supplierComment", header: "Beschaffung" },
          { key: "publisherDate", header: "Publikationsdatum" },
          { key: "physicalSize", header: "Abmessungen" },
          { key: "minAge", header: "Min Alter" },
          { key: "maxAge", header: "Max Alter" },
          { key: "additionalMaterial", header: "Material" },
          { key: "price", header: "Preis" },
          { key: "externalLinks", header: "Links" },
          { key: "userId", header: "Ausgeliehen von" },
        ];

        books.map((b: BookType) => {
          booksheet.addRow(b);
        });

        usersheet.columns = [
          { key: "createdAt", header: "Erzeugt am" },
          { key: "updatedAt", header: "Update am" },
          { key: "id", header: "Nummer" },
          { key: "lastName", header: "Nachname" },
          { key: "firstName", header: "Vorname" },
          { key: "schoolGrade", header: "Klasse" },
          { key: "schoolTeacherName", header: "Lehrkraft" },
          { key: "active", header: "Freigeschaltet" },
          { key: "eMail", header: "eMail" },
        ];

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

    default:
      res.status(405).end(`${req.method} Not Allowed`);
      break;
  }
}
