import { BookType } from "@/entities/BookType";
import { addBook, getAllBooks } from "@/entities/book";
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

type Data = {
  result: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | BookType | Array<BookType>>
) {
  if (req.method === "POST") {
    const book = req.body as BookType;
    try {
      const result = (await addBook(prisma, book)) as BookType;
      console.log(result);
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      res.status(400).json({ result: "ERROR: " + error });
    }
  }

  if (req.method === "GET") {
    try {
      const books = (await getAllBooks(prisma)) as Array<BookType>;
      if (!books)
        return res.status(400).json({ result: "ERROR: Book not found" });
      res.status(200).json(books);
    } catch (error) {
      console.log(error);
      res.status(400).json({ result: "ERROR: " + error });
    }
  }
}
