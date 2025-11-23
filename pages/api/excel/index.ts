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
          const newUser = { ...u } as any;
          newUser.createdAt = convertDateToDayString(u.createdAt);
          newUser.updatedAt = convertDateToDayString(u.updatedAt);
          return newUser;
        });

        const allBooks = await getAllBooks(prisma);
        const books = allBooks.map((b) => {
          const newBook = { ...b } as any;
          newBook.createdAt = convertDateToDayString(b.createdAt);
          newBook.updatedAt = convertDateToDayString(b.updatedAt);
          newBook.rentedDate = b.rentedDate
            ? convertDateToDayString(b.rentedDate)
            : "";
          newBook.dueDate = b.dueDate ? convertDateToDayString(b.dueDate) : "";
          return newBook;
        });

        const workbook = new Excel.Workbook();
        const booksheet = workbook.addWorksheet("Bücherliste");
        const usersheet = workbook.addWorksheet("Userliste");

        booksheet.columns = xlsbookcolumns;

        books.forEach((b: BookType) => {
          booksheet.addRow(b);
        });

        usersheet.columns = xlsusercolumns;

        users.forEach((u: UserType) => {
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
        // Extract import flags from request body
        const importBooks = req.body.importBooks !== false; // default true
        const importUsers = req.body.importUsers !== false; // default true
        const dropBeforeImport = req.body.dropBeforeImport === true; // default false

        const bookData = req.body.bookData?.slice(1) || []; // remove top header row
        const userData = req.body.userData?.slice(1) || [];

        // Validation
        if (!importBooks && !importUsers) {
          return res.status(400).json({
            data: "ERROR: Mindestens eine Import-Option (Bücher oder User) muss aktiviert sein",
            logs: importLog,
          });
        }

        if (importBooks && bookData.length === 0) {
          return res.status(400).json({
            data: "ERROR: Bücher-Import aktiviert, aber keine Bücher-Daten vorhanden",
            logs: importLog,
          });
        }

        if (importUsers && userData.length === 0) {
          return res.status(400).json({
            data: "ERROR: User-Import aktiviert, aber keine User-Daten vorhanden",
            logs: importLog,
          });
        }

        importLog.push(
          `Import-Einstellungen: Bücher=${importBooks}, User=${importUsers}, Vorher löschen=${dropBeforeImport}`
        );

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

        // Create transaction array
        const transaction = [];
        let userImportedCount = 0;
        let bookImportedCount = 0;

        // Add delete operations if dropBeforeImport is true
        if (dropBeforeImport) {
          // Delete books first to avoid foreign key constraints
          if (importBooks) {
            transaction.push(prisma.book.deleteMany({}));
            importLog.push("Alle Bücher werden vor dem Import gelöscht");
          }
          if (importUsers) {
            transaction.push(prisma.user.deleteMany({}));
            importLog.push("Alle User werden vor dem Import gelöscht");
          }
        }

        // Import users first to satisfy foreign key constraints
        if (importUsers && userData.length > 0) {
          userData.forEach((u: any) => {
            transaction.push(
              prisma.user.create({
                data: {
                  id: u["Nummer"],
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
          importLog.push(`${userImportedCount} User werden importiert`);
        } else if (!importUsers) {
          importLog.push("User-Import übersprungen (Flag nicht gesetzt)");
        }

        // Import books after users
        if (importBooks && bookData.length > 0) {
          bookData.forEach((b: any) => {
            transaction.push(
              prisma.book.create({
                data: {
                  id: b["Mediennummer"],
                  rentalStatus: b["Ausleihstatus"],
                  rentedDate: convertDayToISOString(b["Ausgeliehen am"]),
                  dueDate: convertDayToISOString(b["Rückgabe am"]),
                  renewalCount: b["Anzahl Verlängerungen"],
                  title: b["Titel"],
                  subtitle: b["Untertitel"],
                  author: b["Autor"],
                  topics: b["Schlagworte"] || "",
                  imageLink: b["Bild"],
                  isbn: b["ISBN"]?.toString() || "",
                  editionDescription: b["Edition"],
                  publisherLocation: b["Verlagsort"],
                  pages: parseInt(b["Seiten"]) || 0,
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
          importLog.push(`${bookImportedCount} Bücher werden importiert`);
        } else if (!importBooks) {
          importLog.push("Bücher-Import übersprungen (Flag nicht gesetzt)");
        }

        // Execute transaction if there are operations to perform
        if (transaction.length > 0) {
          importLog.push(
            "Transaction für alle Daten erzeugt, importiere jetzt"
          );
          await prisma.$transaction(transaction);
          importLog.push("Daten erfolgreich importiert");
        } else {
          importLog.push("Keine Daten zum Importieren");
        }

        console.log("Importing " + userImportedCount + " users");
        console.log("Importing " + bookImportedCount + " books");

        res.status(200).json({
          result: "Imported dataset",
          imported: {
            users: userImportedCount,
            books: bookImportedCount,
          },
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
