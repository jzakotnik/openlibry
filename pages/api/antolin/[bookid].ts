import { BookType } from "@/entities/BookType";
import { getBook } from "@/entities/book";
import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";
import { promises as fs } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
const prisma = new PrismaClient();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      try {
        if (!req.query.bookid)
          return res.status(404).end(`${req.query} id not found`);
        const bookid = parseInt(req.query.bookid as string);
        //retrieve the book in our database for this ID
        const book = (await getBook(prisma, bookid)) as BookType;

        const dirRelativeToPublicFolder = "antolin/antolingesamt.csv";
        const dir = path.resolve("./public", dirRelativeToPublicFolder);

        const content = await fs.readFile(dir, "latin1");

        //console.log("Content of the csv", content);
        // Parse the CSV content
        const records = await parse(content, {
          bom: true,
          delimiter: ";",
          columns: true,
          skip_empty_lines: true,
        });

        // Initialize the parser
        //console.log("Reading record", records);
        // Use the readable stream api to consume records

        res.setHeader("Content-Type", "application/json");
        res.status(200).send({ bookid: bookid, message: records.length });
      } catch (error) {
        console.log(error);
      }
      break;

    default:
      res.status(405).end(`${req.method} Not Allowed`);
      break;
  }
}
