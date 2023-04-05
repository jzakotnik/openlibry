import { PrismaClient } from "@prisma/client";
import { BookType } from "../../../entities/BookType";
import type { NextApiRequest, NextApiResponse } from "next";
import { addBook } from "@/entities/book";

const prisma = new PrismaClient();

type Data = {
  data: string;
};

type book = {
  book: BookType;
};

const sampleBook = {
  id: 1,
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
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | BookType>
) {
  if (req.method === "POST") {
    //TEST RUN
    addBook(prisma, sampleBook);
    try {
      const booklist = req.body as any;
      const books = booklist[2].data;
      const migratedBooks = books?.map((u: any) => {
        const book = sampleBook;
        //addBook(prisma, book);
        return book;
      });
      console.log(migratedBooks);
      res
        .status(200)
        .json({ data: "User " + JSON.stringify(migratedBooks) + " created" });
    } catch (error) {
      console.log(error);
      res.status(400).json({ data: "ERROR: " + error });
    }
  }
}
