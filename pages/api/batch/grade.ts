import { prisma } from "@/entities/db";
import { increaseUserGrade } from "@/entities/user";
import { LogEvents } from "@/lib/logEvents";
import { errorLogger } from "@/lib/logger";
import type { NextApiRequest, NextApiResponse } from "next";

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
        errorLogger.error(
          {
            event: LogEvents.USER_GRADE_BATCH_UPDATE,
            endpoint: "/api/user/grade",
            method: "POST",
            error: error instanceof Error ? error.message : String(error),
          },
          "Error updating user grades"
        );
        res.status(400).json({ data: "ERROR DELETE: " + error });
      }
      break;

    default:
      res.status(405).end(`${req.method} Not Allowed`);
      break;
  }
}
