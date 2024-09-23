import { BookType } from "@/entities/BookType";
import { getAllBooks } from "@/entities/book";
import { PrismaClient } from "@prisma/client";

import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
const { join } = require("path");

//import template from "./mahnung-template.docx";

import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const testReplacement = {
  school_name: "Testschool",
  responsible_name: "Mickey",
  responsible_contract: "test@test.de",
};
var fs = require("fs");
var template = fs.readFileSync(
  join(process.cwd(), "/public/mahnung-template.docx")
);

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      console.log("Printing reminder letters via API");
      try {
        const allbooks = (await getAllBooks(prisma)) as Array<BookType>;

        try {
          let response = await fetch(template);
          let data = await response.arrayBuffer();
          let zip = new PizZip(data);
          let templateDoc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
          });

          templateDoc.render(testReplacement);
          const generatedDoc = templateDoc.getZip().generate({
            type: "blob",
            mimeType:
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            compression: "DEFLATE",
          });
          res.writeHead(200, {
            "Content-Type": "application/xml",
          });

          res.status(200).json(generatedDoc);
        } catch (error) {
          console.log("Error: " + error);
        }

        if (!allbooks)
          return res.status(400).json({ data: "ERROR: Books  not found" });
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
