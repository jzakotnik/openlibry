import { BookType } from "@/entities/BookType";
import { deleteBook, getBook, updateBook } from "@/entities/book";
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.query.id) return res.status(404).end(`${req.query} id not found`);
  const id = parseInt(req.query.id as string); //single route

  switch (req.method) {
    case "DELETE":
      try {
        const deleteResult = await deleteBook(prisma, id);

        res.status(200).json(deleteResult);
      } catch (error) {
        console.log(error);
        res.status(400).json({ data: "ERROR DELETE: " + error });
      }
      break;

    case "PUT":
      if (!req.body) return res.status(404).end("No data provided");
      const bookdata = req.body as BookType;
      console.log("Handle book request ", bookdata);
      try {
        const updateResult = await updateBook(prisma, id, bookdata);
        res.status(200).json(updateResult);
      } catch (error) {
        console.log(error);
        res.status(400).json({ data: "ERROR DELETE: " + error });
      }

      break;

    case "GET":
      try {
        const book = (await getBook(prisma, id)) as BookType;
        if (!book)
          return res
            .status(400)
            .json({ data: "ERROR: Book with ID " + id + " not found" });
        res.status(200).json(book);
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
