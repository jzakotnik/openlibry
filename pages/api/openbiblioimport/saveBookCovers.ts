//https://api.bookcover.longitood.com/bookcover?book_title=Schule%20der%20magischen%20Tiere%20ermittelt%20Der%20gr%C3%BCne%20Glibber-Brief&author_name=Margit+Auer

import { getAllBooks } from "@/entities/book";
import { BookType } from "@/entities/BookType";
import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/entities/db";

type Data = {
  id: number;
  data: any;
};

type Book = {
  book: BookType;
};

async function fetchCover(url: string, id: string) {
  const result = await fetch(
    "http://localhost:3001/api/saveCovers?url=" + url + "&id=" + id,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).then((response) =>
    response.json().then((x) => {
      console.log("Result of the search", x);
      return x;
    })
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | Book>
) {
  if (req.method === "GET") {
    const { start, stop } = req.query;
    if (Array.isArray(start) || Array.isArray(stop))
      return res.status(400).json({ data: "ERROR query " });
    try {
      const books_all = (await getAllBooks(prisma)).slice(
        parseInt(start!),
        parseInt(stop!)
      );

      const result: any = [];
      books_all.map((b) => {
        //console.log("Processing book", b);
        if (
          b != null &&
          "externalLinks" in b &&
          b.externalLinks != "null" &&
          b.externalLinks != null
        ) {
          const book = JSON.parse(b.externalLinks);
          //console.log("Booklink", book[0]);
          if (Array.isArray(book)) {
            const simpleURL = "https://goodreads.com/" + book[0].split("?")[0];
            console.log("Booklink", simpleURL);
            const result = fetchCover(simpleURL, b.id.toString());
          }
        }
      });
      //console.log(userlist);
      res.status(200).json({ data: JSON.stringify(result) });
    } catch (error) {
      console.log(error);
      res.status(400).json({ data: "ERROR: " + error });
    }
  }
}
