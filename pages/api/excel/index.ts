import { BookType } from "@/entities/BookType";
import { getAllBooks } from "@/entities/book";
import { PrismaClient } from "@prisma/client";
import Excel from "exceljs";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";

const prisma = new PrismaClient();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      try {
        const fileName = "openlibry_export.xlsx";
        const books = (await getAllBooks(prisma)) as Array<BookType>;
        books.map((b: BookType) => {});

        //testing

        type Country = {
          name: string;
          countryCode: string;
          capital: string;
          phoneIndicator: number;
        };

        const countries: Country[] = [
          {
            name: "Cameroon",
            capital: "Yaounde",
            countryCode: "CM",
            phoneIndicator: 237,
          },
          {
            name: "France",
            capital: "Paris",
            countryCode: "FR",
            phoneIndicator: 33,
          },
          {
            name: "United States",
            capital: "Washington, D.C.",
            countryCode: "US",
            phoneIndicator: 1,
          },
          {
            name: "India",
            capital: "New Delhi",
            countryCode: "IN",
            phoneIndicator: 91,
          },
          {
            name: "Brazil",
            capital: "Brasília",
            countryCode: "BR",
            phoneIndicator: 55,
          },
          {
            name: "Japan",
            capital: "Tokyo",
            countryCode: "JP",
            phoneIndicator: 81,
          },
          {
            name: "Australia",
            capital: "Canberra",
            countryCode: "AUS",
            phoneIndicator: 61,
          },
          {
            name: "Nigeria",
            capital: "Abuja",
            countryCode: "NG",
            phoneIndicator: 234,
          },
          {
            name: "Germany",
            capital: "Berlin",
            countryCode: "DE",
            phoneIndicator: 49,
          },
        ];

        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet("Countries List");

        worksheet.columns = [
          { key: "name", header: "Name" },
          { key: "countryCode", header: "Country Code" },
          { key: "capital", header: "Capital" },
          { key: "phoneIndicator", header: "International Direct Dialling" },
        ];

        countries.forEach((item) => {
          worksheet.addRow(item);
        });

        const exportPath = path.resolve(__dirname, "countries.xlsx");

        await workbook.xlsx.writeFile(exportPath);

        if (!books)
          return res.status(400).json({ data: "ERROR: Books not found" });
        res.writeHead(200, {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": "attachment; filename=" + fileName,
        });
        await workbook.xlsx.write(res);
        res.end();
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
