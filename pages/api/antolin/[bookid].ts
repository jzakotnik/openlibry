import { BookType } from "@/entities/BookType";
import { getBook } from "@/entities/book";
import { prisma } from "@/entities/db";
import { parseIdParam } from "@/lib/utils/apiValidation";
import { createAntolinSearchEngine } from "@/lib/utils/antolinIndex";
import type { NextApiRequest, NextApiResponse } from "next";

const removeDuplicates = (searchResults: any) => {
  //console.log("Removing duplicates", searchResults);
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
  //test the zustand store

  switch (req.method) {
    case "GET":
      try {
        //console.log("Getting Antolin info API Call");
        const bookid = parseIdParam(req.query.bookid);
        if (bookid === null) {
          return res.status(400).json({ data: "ERROR: Invalid book ID" });
        }
        //retrieve the book in our database for this ID
        const book = (await getBook(prisma, bookid)) as BookType | null;
        if (!book) {
          return res.status(404).json({ data: "ERROR: Book not found" });
        }

        await createAntolinSearchEngine();
        const searchEngine = (global as any).searchEngine;

        const itemsTitles = searchEngine.search({ query: book.title });
        const itemsAuthors = searchEngine.search({ query: book.author });
        const searchResult = itemsTitles.data.items.concat(
          itemsAuthors.data.items
        );
        //remove duplicates
        //console.log("Antolin search with duplicates", searchResult);
        const cleanedResult = removeDuplicates(searchResult);

        console.log("Antolin items API", cleanedResult, cleanedResult.length);

        res.setHeader("Content-Type", "application/json");
        res.status(200).send({
          foundNumber: cleanedResult.length,
          items: cleanedResult,
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({ data: "ERROR: Antolin search failed" });
      }
      break;

    default:
      res.status(405).end(`${req.method} Not Allowed`);
      break;
  }
}
