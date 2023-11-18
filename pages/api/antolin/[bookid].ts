import { BookType } from "@/entities/BookType";
import { getBook } from "@/entities/book";
import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";
import { promises as fs } from "fs";
import itemsjs from "itemsjs";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
const prisma = new PrismaClient();

const removeDuplicates = (searchResults: any) => {
  console.log("Removing duplicates", searchResults);
  const withoutDups = searchResults.reduce((accumulator: any, current: any) => {
    if (!accumulator.find((item: any) => item.Titel === current.Titel)) {
      accumulator.push(current);
    }
    return accumulator;
  }, []);

  return withoutDups;
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      try {
        console.log("Getting Antolin info API Call");
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

        //figure out if our book is in the antolin DB?
        console.time("searchEngine init");
        const searchEngine = itemsjs(records, {
          searchableFields: ["Titel", "Autor"],
        });
        console.timeEnd("searchEngine init");
        console.time("search");
        const itemsTitles = searchEngine.search({ query: book.title });
        const itemsAuthors = searchEngine.search({ query: book.author });
        const searchResult = itemsTitles.data.items.concat(
          itemsAuthors.data.items
        );
        //remove duplicates
        console.log("Antolin search with duplicates", searchResult);
        const cleanedResult = removeDuplicates(searchResult);

        console.timeEnd("search");
        console.log("Antolin items API", cleanedResult);

        res.setHeader("Content-Type", "application/json");
        res.status(200).send({
          foundNumber: cleanedResult.length,
          items: cleanedResult,
        });
      } catch (error) {
        console.log(error);
      }
      break;

    default:
      res.status(405).end(`${req.method} Not Allowed`);
      break;
  }
}
