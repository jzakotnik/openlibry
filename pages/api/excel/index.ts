import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import { getAllBooks } from "@/entities/book";
import { prisma } from "@/entities/db";
import { getAllUsers } from "@/entities/user";
import {
  convertDateToDayString,
  convertDayToISOString,
} from "@/lib/utils/dateutils";
import { xlsbookcolumns, xlsusercolumns } from "@/lib/utils/xlsColumnsMapping";
import Excel from "exceljs";
import type { NextApiRequest, NextApiResponse } from "next";

import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";

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

        businessLogger.info(
          {
            event: LogEvents.REPORT_EXCEL_EXPORTED,
            bookCount: books.length,
            userCount: users.length,
            fileName,
          },
          "Excel export completed"
        );

        res.writeHead(200, {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": "attachment; filename=" + fileName,
        });
        await workbook.xlsx.write(res);
        res.end();
      } catch (error) {
        errorLogger.error(
          {
            event: LogEvents.API_ERROR,
            endpoint: "/api/excel",
            method: "GET",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
          "Failed to export Excel file"
        );
        res.status(400).json({ data: "ERROR: " + error });
      }
      break;

    case "POST":
      const importLog = ["Starte den Transfer in die Datenbank"];

      try {
        const importBooks = req.body.importBooks !== false;
        const importUsers = req.body.importUsers !== false;
        const dropBeforeImport = req.body.dropBeforeImport === true;

        const bookData = req.body.bookData?.slice(1) || [];
        const userData = req.body.userData?.slice(1) || [];

        businessLogger.info(
          {
            event: LogEvents.IMPORT_EXCEL_STARTED,
            importBooks,
            importUsers,
            dropBeforeImport,
            bookCount: bookData.length,
            userCount: userData.length,
          },
          "Excel import started"
        );

        // Validation
        if (!importBooks && !importUsers) {
          businessLogger.warn(
            {
              event: LogEvents.IMPORT_EXCEL_FAILED,
              reason: "No import option selected",
            },
            "Excel import rejected - no import options"
          );
          return res.status(400).json({
            data: "ERROR: Mindestens eine Import-Option (Bücher oder User) muss aktiviert sein",
            logs: importLog,
          });
        }

        if (importBooks && bookData.length === 0) {
          businessLogger.warn(
            {
              event: LogEvents.IMPORT_EXCEL_FAILED,
              reason: "Books import enabled but no book data",
            },
            "Excel import rejected - missing book data"
          );
          return res.status(400).json({
            data: "ERROR: Bücher-Import aktiviert, aber keine Bücher-Daten vorhanden",
            logs: importLog,
          });
        }

        if (importUsers && userData.length === 0) {
          businessLogger.warn(
            {
              event: LogEvents.IMPORT_EXCEL_FAILED,
              reason: "Users import enabled but no user data",
            },
            "Excel import rejected - missing user data"
          );
          return res.status(400).json({
            data: "ERROR: User-Import aktiviert, aber keine User-Daten vorhanden",
            logs: importLog,
          });
        }

        importLog.push(
          `Import-Einstellungen: Bücher=${importBooks}, User=${importUsers}, Vorher löschen=${dropBeforeImport}`
        );
        importLog.push(
          `Header Zeilen aus Excel entfernt, damit bleiben ${bookData.length} Bücher und ${userData.length} User`
        );

        businessLogger.debug(
          {
            event: LogEvents.IMPORT_EXCEL_STARTED,
            sampleBooks: bookData.slice(0, 2),
            sampleUsers: userData.slice(0, 2),
          },
          "Excel import data sample"
        );

        const transaction = [];
        let userImportedCount = 0;
        let bookImportedCount = 0;

        // Delete operations if dropBeforeImport is true
        if (dropBeforeImport) {
          if (importBooks) {
            transaction.push(prisma.book.deleteMany({}));
            importLog.push("Alle Bücher werden vor dem Import gelöscht");
          }
          if (importUsers) {
            transaction.push(prisma.user.deleteMany({}));
            importLog.push("Alle User werden vor dem Import gelöscht");
          }

          businessLogger.warn(
            {
              event: LogEvents.IMPORT_EXCEL_DROP_BEFORE,
              dropBooks: importBooks,
              dropUsers: importUsers,
            },
            "Excel import will delete existing data before import"
          );
        }

        // Import users first (foreign key constraints)
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

        // Execute transaction
        if (transaction.length > 0) {
          importLog.push(
            "Transaction für alle Daten erzeugt, importiere jetzt"
          );
          await prisma.$transaction(transaction);
          importLog.push("Daten erfolgreich importiert");
        } else {
          importLog.push("Keine Daten zum Importieren");
        }

        businessLogger.info(
          {
            event: LogEvents.IMPORT_EXCEL_COMPLETED,
            usersImported: userImportedCount,
            booksImported: bookImportedCount,
            dropBeforeImport,
          },
          "Excel import completed successfully"
        );

        res.status(200).json({
          result: "Imported dataset",
          imported: {
            users: userImportedCount,
            books: bookImportedCount,
          },
          logs: importLog,
        });
      } catch (error) {
        errorLogger.error(
          {
            event: LogEvents.IMPORT_EXCEL_FAILED,
            endpoint: "/api/excel",
            method: "POST",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
          "Excel import failed"
        );

        importLog.push("Fehler beim Import: " + (error as Error).toString());
        res.status(400).json({ data: "ERROR: " + error, logs: importLog });
      }
      break;

    default:
      errorLogger.warn(
        {
          event: LogEvents.API_ERROR,
          endpoint: "/api/excel",
          method: req.method,
          reason: "Method not allowed",
        },
        "Unsupported HTTP method for Excel endpoint"
      );
      res.status(405).end(`${req.method} Not Allowed`);
      break;
  }
}
