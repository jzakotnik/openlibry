import { BookType } from "@/entities/BookType";
import { getAllBooks } from "@/entities/book";
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import xlsx from "node-xlsx";

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
  var buffer = xlsx.build([{ name: "mySheetName", data: data }]);

  switch (req.method) {
    case "GET":
      try {
        const books = (await getAllBooks(prisma)) as Array<BookType>;
        books.map((b: BookType) => {});
        const data = [HEADER_ROW, DATA_ROW_1];

        const buffer = await writeXlsxFile(data as any, { buffer: true });
        if (!books)
          return res.status(400).json({ data: "ERROR: Books not found" });
        res.writeHead(200, {
          "Content-Type": "application/vnd.ms-excel",
          "Content-Length": buffer.size,
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
