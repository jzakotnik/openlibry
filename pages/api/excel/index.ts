import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import { getAllBooks } from "@/entities/book";
import { prisma } from "@/entities/db";
import { getAllUsers } from "@/entities/user";
import {
  convertDateToDayString,
  convertDayToISOString,
} from "@/utils/dateutils";
import { xlsbookcolumns, xlsusercolumns } from "@/utils/xlsColumnsMapping";
import Excel from "exceljs";
import type { NextApiRequest, NextApiResponse } from "next";

const MAX_MIGRATION_SIZE = process.env.MAX_MIGRATION_SIZE || "250mb";

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
      const importLog = ["Starte den Transfer in die Datenbank"];
      try {
        const bookData = req.body.bookData.slice(1); //remove top header row of excel
        const userData = req.body.userData.slice(1);
        importLog.push(
          "Header Zeilen aus Excel entfernt, damit bleiben " +
            bookData.length +
            " Bücher und " +
            userData.length +
            " User"
        );

        console.log(
          "Received import xls, it contains so many books and users: ",
          bookData.length,
          userData.length
        );
        console.log("Example: ", bookData.slice(0, 5), userData.slice(0, 5));

        //create a big transaction to import all users and books (or do nothing if something fails)
        const transaction = [] as any;
        var userImportedCount = 0;
        //transaction.push(prisma.user.deleteMany({})); //start with empty table
        userData.map((u: any) => {
          transaction.push(
            prisma.user.create({
              data: {
                id: u["Nummer"], //TODO refactoring to re-use the mapping from utils xls mapping
                lastName: u["Nachname"],
                firstName: u["Vorname"],
                schoolGrade: u["Klasse"],
                schoolTeacherName: u["Lehrkraft"],
                active: u["Freigeschaltet"],
              },
            })
          );
          userImportedCount++;
        });
        var bookImportedCount = 0;
        bookData.map((b: any) => {
          transaction.push(
            prisma.book.create({
              //TODO this needs a more configurable mapping
              data: {
                id: b["Mediennummer"],
                rentalStatus: b["Ausleihstatus"],
                rentedDate: convertDayToISOString(b["Ausgeliehen am"]),
                dueDate: convertDayToISOString(b["Rückgabe am"]),
                renewalCount: b["Anzahl Verlängerungen"],
                title: b["Titel"],
                subtitle: b["Untertitel"],
                author: b["Autor"],
                topics: b["Schlagworte"] ? b["Schlagworte"] : "",
                imageLink: b["Bild"],
                isbn: b["ISBN"].toString(),
                editionDescription: b["Edition"],
                publisherLocation: b["Verlagsort"],
                pages: parseInt(b["Seiten"]),
                summary: b["Zusammenfassung"],
                minPlayers: b["Min Spieler"],
                publisherName: b["Verlag"],
                otherPhysicalAttributes: b["Merkmale"],
                supplierComment: b["Beschaffung"],
                publisherDate: b["Publikationsdatum"],
                physicalSize: b["Abmessungen"],
                minAge: b["Min Alter"],
                maxAge: b["Max Alter"],
                additionalMaterial: b["Material"],
                price: b["Preis"],
                externalLinks: b["Links"],
                userId: b["Ausgeliehen von"],
              },
            })
          );
          bookImportedCount++;
        });
        importLog.push("Transaction für alle Daten erzeugt, importiere jetzt");
        await prisma.$transaction(transaction);
        importLog.push("Daten importiert");

        console.log("Importing " + userImportedCount + " users");
        console.log("Importing " + bookImportedCount + " books");

        res.status(200).json({
          result: "Imported dataset",
          logs: importLog,
        });
      } catch (error) {
        console.log(error);
        importLog.push("Fehler beim Import: " + (error as string).toString());
        res.status(400).json({ data: "ERROR: " + error, logs: importLog });
      }
      break;
    default:
      res.status(405).end(`${req.method} Not Allowed`);
      break;
  }
}
