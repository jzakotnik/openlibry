//https://api.bookcover.longitood.com/bookcover?book_title=Schule%20der%20magischen%20Tiere%20ermittelt%20Der%20gr%C3%BCne%20Glibber-Brief&author_name=Margit+Auer

import { getAllBooks, updateBook } from "@/entities/book";
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

async function fetchCover(url: string, results: any) {
  const result = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) =>
    response.json().then((x) => {
      console.log("Result of the search", x);
      results.push(x);
      return x;
    })
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | Book>
) {
  if (req.method === "GET") {
    try {
      const books_all = await getAllBooks(prisma);
      const result: any = [];
      //console.log(userlist);
      const { start, stop } = req.query;
      if (Array.isArray(start) || Array.isArray(stop))
        return res.status(400).json({ data: "ERROR query " });
      const books = books_all.slice(parseInt(start!), parseInt(stop!));
      console.log("Searching books", books, req.query);

      //http://localhost:2000/bookcover?book_title=Die%20Schule%20der%20magischen%20Tiere%20ermittelt&author_name=Margit%20Auer

      await Promise.all(
        books.map(async (b) => {
          //try some sanitization for better search
          const sanitizedTitle = b.title.replace(/[.,]/g, " ");
          const sanitizedAuthor = b.author.replace(/[.,]/g, " ");
          const url = encodeURI(
            "https://www.goodreads.com/search?q=" +
              sanitizedTitle +
              "&search_type=books&search[field]=on"
          );
          console.log("Searching url", url);
          const { updatedAt, createdAt, dueDate, ...newBook } = b as any;

          await fetch(url).then((response) =>
            response.text().then((x) => {
              console.log("Result of the search", x);
              const regex = /\/book\/show[^\s]+/g; // regex to match "/book/show" substring
              const matches = x.match(regex); // search for matches in the string

              result.push({ id: b.id, title: b.title, bookURLs: matches });

              newBook.externalLinks = JSON.stringify(matches);
            })
          );
          const updated = await updateBook(prisma, b.id, newBook);
          console.log("Updated", updated);
          console.log("Book URLs", result);
          return { id: b.id, title: b.title, bookURLs: result };
        })
      );
      console.log("x", result);
      res.status(200).json({ data: result });
    } catch (error) {
      console.log(error);
      res.status(400).json({ data: "ERROR: " + error });
    }
  }
}
