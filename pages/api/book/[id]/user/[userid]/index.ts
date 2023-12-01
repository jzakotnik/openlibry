import { BookType } from "@/entities/BookType";
import { hasRentedBook, rentBook, returnBook } from "@/entities/book";
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
  //rent a book
  if (req.method === "POST") {
    console.log("Rent book for user and book", req.query);
    if (!req.query.id || !req.query.userid)
      return res
        .status(400)
        .json({ result: "ERROR, rented book or user not specified" });

    const book = req.body as BookType;
    try {
      //console.log("Rent book for user and book", req.query);
      const rental = await rentBook(
        prisma,
        parseInt(req.query.userid as string),
        parseInt(req.query.id as string)
      );
      res.status(200).json({ result: JSON.stringify(rental) });
    } catch (error) {
      console.log(error);
      res.status(400).json({ result: "ERROR: " + error });
    }
  }

  //give the book back
  if (req.method === "DELETE") {
    if (!req.query.id)
      return res
        .status(400)
        .json({ result: "ERROR, rented book or user not specified" });

    const book = req.body as BookType;
    try {
      console.log("Return book for user and book", req.query);
      const rental = await returnBook(prisma, parseInt(req.query.id as string));
      res.status(200).json({ result: JSON.stringify(rental) });
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
