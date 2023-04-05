import { PrismaClient } from "@prisma/client";
import { BookType } from "../../../entities/BookType";
import type { NextApiRequest, NextApiResponse } from "next";
import { addBook } from "@/entities/book";

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb", // Set desired value here
    },
  },
};

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
  price: 3,
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | BookType>
) {
  if (req.method === "POST") {
    //TEST RUN
    //addBook(prisma, sampleBook);
    var importedBooksCount = 0;
    try {
      const booklist = req.body as any;
      console.log("Booklist", booklist);
      const books = booklist.biblio[2].data;
      const bookStatus = booklist.biblio_hist[2].data;
      const bookExtraFields = booklist.fields[2].data;
      //console.log("Received data", books, bookStatus, bookExtraFields);
      const migratedBooks = books?.map((u: any) => {
        //map the fields from OpenBiblio correctly:
        /*console.log(
          "Importing book nr " + importedBooksCount + ", which is ",
          u
        );*/
        //console.log("Importing book", u);
        const book = {
          id: parseInt(u.bibid),
          rentalStatus: (u.status_cd ??= "out"),
          rentedDate: (u.status_begin_dt ??= new Date()),
          dueDate: (u.due_back_dt ??= new Date()),
          renewalCount: parseInt((u.renewal_count ??= 0)),
          title: (u.title ??= "FEHLER Titel nicht importiert"),
          subtitle: (u.title_remainder ??= "FEHLER Titel nicht importiert"),
          author: (u.author ??= "FEHLER Autor nicht importiert"),
          topics:
            (u.topic1 ??= " ") +
            ";" +
            (u.topic2 ??= " ") +
            ";" +
            (u.topic3 ??= " ") +
            ";" +
            (u.topic4 ??= " ") +
            ";" +
            (u.topic5 ??= " "),
          imageLink: "",
        } as BookType;
        console.log("Adding BookType book", book);
        addBook(prisma, book);
        importedBooksCount++;
        return book;
      });

      res.status(200).json({ data: importedBooksCount + " Books created" });
    } catch (error) {
      console.log(error);
      res.status(400).json({ data: "ERROR: " + error });
    }
  }
}
