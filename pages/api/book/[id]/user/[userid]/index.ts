import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { hasRentedBook, addBook } from "@/entities/book";
import { BookType } from "@/entities/BookType";

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
    if (!req.query.id || !req.query.userid)
      return res
        .status(400)
        .json({ result: "ERROR, rented book not specified" });
    try {
      console.log("User + Book", req.query);
      const rental = await hasRentedBook(
        prisma,
        parseInt(req.query.id as string),
        parseInt(req.query.userid as string)
      );

      res.status(200).json({ result: rental.toString() });
    } catch (error) {
      console.log(error);
      res.status(400).json({ result: "ERROR: " + error });
    }
  }
}
