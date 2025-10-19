import { increaseUserGrade } from "@/entities/user";
import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/entities/db";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "POST":
      try {
        if (!req.body) return res.status(404).end("No data provided");
        //gets a list of user IDs to update the grade
        const userdata = req.body;

        const updateResult = await increaseUserGrade(prisma, userdata);

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
