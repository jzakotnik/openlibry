import { getRentedBooksWithUsers } from "@/entities/book";
import { PrismaClient } from "@prisma/client";

import Docxtemplater from "docxtemplater";
import fs from "fs";
import { join } from "path";
import PizZip from "pizzip";

import { convertDateToDayString } from "@/utils/dateutils";
import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const SCHOOL_NAME = process.env.SCHOOL_NAME || "Schule";
const REMINDER_RESPONSIBLE_NAME =
  process.env.REMINDER_RESPONSIBLE_NAME || "Schulbücherei";
const REMINDER_RESPONSIBLE_EMAIL =
  process.env.REMINDER_RESPONSIBLE_EMAIL || "email";
const REMINDER_RENEWAL_COUNT = process.env.REMINDER_RENEWAL_COUNT || 5;

//example structure
/*
const replacemenetVariables = {
  alleMahnungen: [
    {
      school_name: SCHOOL_NAME,
      responsible_name: REMINDER_RESPONSIBLE_NAME,
      responsible_contact_email: REMINDER_RESPONSIBLE_EMAIL,
    },
    {
      school_name: SCHOOL_NAME,
      responsible_name: REMINDER_RESPONSIBLE_NAME,
      responsible_contact_email: REMINDER_RESPONSIBLE_EMAIL,
    },
  ],
};
*/
const replacemenetVariables = {
  alleMahnungen: [] as any,
};

console.log("Template replacement", replacemenetVariables);

const template = fs.readFileSync(
  join(process.cwd(), "/public/" + process.env.REMINDER_TEMPLATE_DOC)
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
        //const allbooks = (await getAllBooks(prisma)) as Array<BookType>;
        //calculate the rental information
        const allRentals = await getRentedBooksWithUsers(prisma);
        const rentals = allRentals.map((r: any) => {
          //calculate remaining days for the rental
          const due = dayjs(r.dueDate);
          const today = dayjs();
          const diff = today.diff(due, "days");
          //console.log("Fetching rental", r);
          return {
            id: r.id,
            title: r.title,
            lastName: r.user?.lastName,
            firstName: r.user?.firstName,
            remainingDays: diff,
            dueDate: convertDateToDayString(due.toDate()),
            renewalCount: r.renewalCount,
            userid: r.user?.id,
          };
        });
        //TODO this can be optimized to one step with the retrieval of all rentals, but it's easier to read for now
        const overdueRentals = rentals.filter(
          (r) => r.renewalCount >= 5 && r.remainingDays > 0
        );
        //cluster overdue books by the user for the overdue notices
        const overDueRentalsByUser = overdueRentals.reduce((acc: any, curr) => {
          const { userid, ...rest } = curr; // Extract id and keep the rest
          acc[userid] ? acc[userid].push(rest) : (acc[userid] = [rest]);
          return acc;
        }, {});

        console.log("Rentals", overDueRentalsByUser);

        //map overdueRentals to the docxtemplater template
        Object.keys(overDueRentalsByUser).map((userID) => {
          replacemenetVariables.alleMahnungen.push({
            school_name: SCHOOL_NAME,
            responsible_name: REMINDER_RESPONSIBLE_NAME,
            responsible_contact_email: REMINDER_RESPONSIBLE_EMAIL,
            overdue_username:
              overDueRentalsByUser[userID][0].firstName +
              " " +
              overDueRentalsByUser[userID][0].lastName,
            book_list: overDueRentalsByUser[userID]
              .map((b) => b.title)
              .join(", "),
          });
        });

        try {
          //let data = await template.arrayBuffer();
          const zip = new PizZip(template);
          const templateDoc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
          });

          templateDoc.render(replacemenetVariables);
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

        if (!allRentals)
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
