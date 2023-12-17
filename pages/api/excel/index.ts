import { BookType } from "@/entities/BookType";
import { getAllBooks } from "@/entities/book";
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //Sample data
  const data = [
    [1, 2, 3],
    [true, false, null, "sheetjs"],
    ["foo", "bar", new Date("2014-02-19T14:30Z"), "0.3"],
    ["baz", null, "qux"],
  ];

  switch (req.method) {
    case "GET":
      try {
        const books = (await getAllBooks(prisma)) as Array<BookType>;
        books.map((b: BookType) => {});

        if (!books)
          return res.status(400).json({ data: "ERROR: Books not found" });
        res.writeHead(200, {
          "Content-Type": "application/vnd.ms-excel",
        });
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
