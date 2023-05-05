//https://api.bookcover.longitood.com/bookcover?book_title=Schule%20der%20magischen%20Tiere%20ermittelt%20Der%20gr%C3%BCne%20Glibber-Brief&author_name=Margit+Auer

import { PrismaClient } from "@prisma/client";
import { UserType } from "../../../entities/UserType";
import type { NextApiRequest, NextApiResponse } from "next";
import { getAllBooks } from "@/entities/book";
import { BookType } from "@/entities/BookType";

const prisma = new PrismaClient();

type Data = {
  data: string;
};

type Book = {
  book: BookType;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | Book>
) {
  if (req.method === "GET") {
    try {
      const books_all = await getAllBooks(prisma);
      const result: any = [];
      //console.log(userlist);
      const books = books_all.slice(0, 2);

      await books.map((b) => {
        const cover: any = fetch(
          encodeURI(
            "https://api.bookcover.longitood.com/bookcover?book_title=" +
              b.title +
              "&author_name=" +
              b.author
          ),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        ).then((response) =>
          response.json().then((x) => {
            console.log(x);
            result.push(x);
          })
        );
      });
      res.status(200).json({ data: result });
    } catch (error) {
      console.log(error);
      res.status(400).json({ data: "ERROR: " + error });
    }
  }
}
