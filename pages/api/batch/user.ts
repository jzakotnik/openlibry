import { deleteManyUsers } from "@/entities/user";
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "DELETE":
      try {
        if (!req.body) return res.status(404).end("No data provided");
        //gets a list of user IDs to update the grade
        const userdata = req.body;

        const updateResult = await deleteManyUsers(prisma, userdata);

        res.status(200).json(updateResult);
      } catch (error) {
        console.log(error);
        res.status(400).json({ data: "ERROR DELETE: " + error });
      }
      break;

    default:
      res.status(405).end(`${req.method} Not Allowed`);
      break;
  }
}
