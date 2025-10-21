import { BookType } from "@/entities/BookType";
import type { NextApiRequest, NextApiResponse } from "next";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

export const TIMEZONE = "Europe/Berlin";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

import { prisma } from "@/entities/db";

const MAX_MIGRATION_SIZE = process.env.MAX_MIGRATION_SIZE || "250mb";

type Data = {
  data: string;
};

type book = {
  book: BookType;
};

//this is some sample data for the migration
const sampleBook = {
  id: 2,
  rentalStatus: "out",
  rentedDate: new Date(),
  dueDate: new Date(),
  renewalCount: 3,
  title: "Buch titel",
  subtitle: "Buch Subtitel",
  author: "Jure",
  topics: "Schlagwort",
  imageLink: "url",
  //additional fields from OpenBiblio data model
  isbn: "123",
  editionDescription: "Edition",
  publisherLocation: "Mammolshain",
  pages: 123,
  summary: "Zusammenfassung",
  minPlayers: "2-3",
  publisherName: "Publish Jure",
  otherPhysicalAttributes: "gebraucht",
  supplierComment: "supplier",
  publisherDate: "yea",
  physicalSize: "xl",
  minAge: "5",
  maxAge: "89",
  additionalMaterial: "CD",
  price: "3",
  userId: 1356,
};

const sampleBookFromOpenBiblio = {
  bibid: "2185",
  copyid: "2185",
  copy_desc: "",
  barcode_nmbr: "2185",
  status_cd: "out",
  status_begin_dt: "2006-06-09 10:17:18",
  due_back_dt: "2006-06-30",
  mbrid: "1035",
  renewal_count: "0",
  create_dt: "2005-05-24 20:08:39",
  last_change_dt: "2023-01-27 10:56:54",
  last_change_userid: "4",
  material_cd: "2",
  collection_cd: "6",
  call_nmbr1: "Bücherei",
  call_nmbr2: "",
  call_nmbr3: "",
  title: "Die Wilden Fußballkerle. Bd. 09: Joschka, die siebte Kavallerie",
  title_remainder: "",
  responsibility_stmt: "",
  author: "Masannek, Joachim",
  topic1: "Fußball",
  topic2: "Teamgeist",
  topic3: "",
  topic4: "",
  topic5: "",
  opac_flg: "Y",
};

const sampleStatusFromOpenBiblio = {
  bibid: "3717",
  copyid: "3696",
  status_cd: "crt",
  status_begin_dt: "2022-11-11 12:19:35",
  due_back_dt: null,
  mbrid: "1428",
  renewal_count: "0",
};

//field mapping from fields and subfields in OpenBiblio that were used in this data model
const fieldMapping = (openbibliofieldname: string) => {
  switch (openbibliofieldname) {
    case "20a":
      return "isbn";
      break;
    case "20c":
      return "supplierComment";
      break;
    case "250a":
      return "editionDescription";
      break;
    case "260a":
      return "publisherLocation";
      break;
    case "260b":
      return "publisherName";
      break;
    case "260c":
      return "publisherDate";
      break;
    case "300a":
      return "pages";
      break;
    case "300b":
      return "otherPhysicalAttributes";
      break;
    case "300c":
      return "physicalSize";
      break;
    case "300e":
      return "additionalMaterial";
      break;
    case "520a":
      return "summary";
      break;
    case "541h":
      return "price";
      break;
    case "901a":
      return "minPlayers";
      break;
    case "901c":
      return "minAge";
      break;
    case "901d":
      return "maxAge";
      break;
    default:
      console.log("ERROR Field not found ", openbibliofieldname);
      return "fieldNotFound";
  }
};

const transformRentalStatus = (openbibliorental: string) => {
  switch (openbibliorental) {
    case "in":
      return "available";
      break;
    case "out":
      return "rented";
      break;
    case "mnd":
      return "broken";
      break;
    case "dis":
      return "presentation";
      break;
    case "hld":
      return "ordered";
      break;
    case "lst":
      return "lost";
      break;
    case "ln":
      return "remote";
      break;
    case "ord":
      return "ordered";
      break;
    case "crt":
      return "available";
    default:
      console.log("ERROR, rental status not found");
      return "ERROR. not found";
  }
};

function createBookIDMapping(bookCopy: any) {
  const mapping: { [key: string]: number } = {};
  var count = 0;
  const updated = bookCopy.map((b: any) => {
    mapping[b.bibid] = parseInt(b.barcode_nmbr);
    count++;
  });
  console.log("Mapped books:", count);
  return mapping;
}

function filterForBarcode(data: any, mapping: any) {
  var count = 0;
  //console.log("Filtering data", data);
  const updatedData: any = [];

  data.map((d: any) => {
    if (d.bibid in mapping) {
      count++;
      //console.log("Found this book with barcode", d );
      updatedData.push({ ...d });
    } else {
      return;
      //console.log("Book has no barcode", d);
    }
  });
  console.log("Filtered for barcode: ", updatedData.length, data.length, count);
  return updatedData;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | BookType>
) {
  if (req.method === "POST") {
    //reset database first for fresh migration, this all needs to be done in one transaction
    const transaction = [];
    transaction.push(prisma.book.deleteMany({}));
    let importedBooksCount = 0;

    //do not import books without a barcode!
    try {
      const booklist = req.body as any;
      //console.log("Booklist", booklist);
      const bookCopy = booklist.biblio_copy[2].data;
      //bibid to barcode id, which is used in openlibry since it's printed in the books already!
      const bookIDMapping = createBookIDMapping(bookCopy);
      //filter out the books that have no barcode..
      const books = filterForBarcode(booklist.biblio[2].data, bookIDMapping);
      console.log("Filtered books", books.length);
      const bookStatus = filterForBarcode(
        booklist.biblio_hist[2].data,
        bookIDMapping
      );
      console.log("Filtered book status", bookStatus.length);

      const bookExtraFields = filterForBarcode(
        booklist.fields[2].data,
        bookIDMapping
      );
      console.log("Filtered book fields", bookExtraFields.length);
      const users = booklist.users[2].data;
      //console.log(users);
      const existingUsers = new Set();
      users.map((u: any) => {
        //console.log(u);
        existingUsers.add(parseInt(u.mbrid));
      });

      //First create basic table with the biblio table books
      books?.map((b: any) => {
        //map the fields from OpenBiblio correctly:

        const barcodeID = bookIDMapping[b.bibid];
        if (isNaN(barcodeID)) {
          console.log("Barcode not found", b.bibid);
          return;
        }

        const book = {
          id: barcodeID,
          rentalStatus: transformRentalStatus(b.status_cd),
          rentedDate: (b.status_begin_dt ??= new Date()),
          dueDate: (b.due_back_dt ??= new Date()),
          renewalCount: parseInt((b.renewal_count ??= 0)),
          title: (b.title ??= "FEHLER Titel nicht importiert"),
          subtitle: (b.title_remainder ??= "FEHLER Titel nicht importiert"),
          author: (b.author ??= "FEHLER Autor nicht importiert"),
          topics:
            (b.topic1 ??= " ") +
            ";" +
            (b.topic2 ??= " ") +
            ";" +
            (b.topic3 ??= " ") +
            ";" +
            (b.topic4 ??= " ") +
            ";" +
            (b.topic5 ??= " "),
          imageLink: "",
        } as BookType;
        //console.log("Adding book", book);
        //transaction.push(addBook(prisma, book));
        //addBook(prisma, book);
        transaction.push(prisma.book.create({ data: { ...book } }));
        importedBooksCount++;
        return book;
      });
      console.log("Created books", importedBooksCount);

      //Now all the books from the biblio table are imported with their values and rental status. But they are not connected to the users yet if renter
      //Attach rental status from history table in OpenBiblio
      let rentalStatusCount = 0;
      bookCopy?.map((b: any) => {
        const barcodeID = bookIDMapping[b.bibid];
        //skip the books that are not needed
        //rented date has format 2022-11-11 12:37:39
        //if the book is in, the value in the DB is NULL
        const rentedTime = dayjs(
          b.status_begin_dt,
          "YYYY-MM-DD HH:mm:ss",
          true
        ).isValid()
          ? dayjs(b.status_begin_dt, "YYYY-MM-DD HH:mm:ss", true).toDate()
          : undefined;
        const dueDate = dayjs(b.due_back_dt, "YYYY-MM-DD", true).isValid()
          ? dayjs(b.due_back_dt, "YYYY-MM-DD", true).toDate()
          : undefined;

        console.log("Timestamps: ", rentedTime, dueDate);

        //connect the book to the user, if it still exists

        console.log("Connecting user ", b.mbrid);
        if (existingUsers.has(parseInt(b.mbrid)) && b.status_cd == "out") {
          rentalStatusCount++;
          transaction.push(
            prisma.user.update({
              where: {
                id: parseInt(b.mbrid),
              },
              data: {
                books: {
                  connect: {
                    id: barcodeID,
                  },
                },
              },
            })
          );
        }

        // update the rest
        const bookUpdate = {
          rentalStatus: transformRentalStatus(b.status_cd),
          rentedDate: rentedTime,
          dueDate: dueDate,
          renewalCount: parseInt(b.renewal_count),
        } as BookType;

        transaction.push(
          prisma.book.update({
            where: {
              id: barcodeID,
            },
            data: { ...bookUpdate },
          })
        );
      });

      //Attach additional fields from the fields table in OpenBiblio
      let additionalFieldsCount = 0;
      console.log(bookExtraFields);
      bookExtraFields.map((f: any) => {
        const barcodeID = bookIDMapping[f.bibid];
        if (isNaN(barcodeID)) {
          console.log("Barcode not found", f.bibid);
          return;
        }
        //console.log(f);
        //wow this is dirty
        const combinedTag = f.tag + f.subfield_cd;
        const fieldUpdate = {} as any;
        const fieldTag = fieldMapping(combinedTag);
        let fieldData;

        if (fieldTag == "pages") {
          //console.log(f.bibid, f.field_data);
          //skip Seiten string
          const removedText = f.field_data.replace("Seiten", "");
          fieldData = parseInt(removedText) || 0;
        } else fieldData = f.field_data;

        fieldUpdate[fieldTag] = fieldData;
        //console.log("Updating field", fieldUpdate);
        transaction.push(
          prisma.book.update({
            where: {
              id: barcodeID,
            },
            data: { ...fieldUpdate },
          })
        );

        additionalFieldsCount++;
      });

      //execute all queries in sequential order
      prisma.$transaction(transaction);

      res.status(200).json({
        data: `${importedBooksCount} Books created with ${rentalStatusCount} rental status and ${additionalFieldsCount} fields`,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({ data: "ERROR: " + error });
    }
  }
}
