import { BookType } from "@/entities/BookType";
import { getAllBooks } from "@/entities/book";
import { PrismaClient } from "@prisma/client";

import Docxtemplater from "docxtemplater";
import fs from "fs";
import { join } from "path";
import PizZip from "pizzip";

import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const testReplacement = {
  school_name: "Testschool",
  responsible_name: "Mickey",
  responsible_contract: "test@test.de",
};

const template = fs.readFileSync(
  join(process.cwd(), "/public/mahnung-template.docx")
);
//console.log("Template", template);

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
          //let data = await template.arrayBuffer();
          const zip = new PizZip(template);
          const templateDoc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
          });

          templateDoc.render(testReplacement);
          const generatedDoc = templateDoc.getZip().generate({
            type: "nodebuffer",
            mimeType:
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            compression: "DEFLATE",
          });
          console.log("Generated doc", generatedDoc);
          res.writeHead(200, {
            "Content-Type": "application/msword",
          });

          res.status(200).send(generatedDoc);
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
