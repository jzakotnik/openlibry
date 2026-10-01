import { prisma } from "@/entities/db";
import { deleteManyUsers } from "@/entities/user";
import { parseIdList } from "@/lib/utils/apiValidation";
import { LogEvents } from "@/lib/logEvents";
import { errorLogger } from "@/lib/logger";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "DELETE":
      try {
        //gets a list of user IDs to delete
        const userdata = parseIdList(req.body);
        if (!userdata) {
          return res
            .status(400)
            .json({ data: "ERROR: Expected an array of user IDs" });
        }

        const updateResult = await deleteManyUsers(prisma, userdata);

        res.status(200).json(updateResult);
      } catch (error) {
        errorLogger.error(
          {
            event: LogEvents.USER_BATCH_DELETE,
            endpoint: "/api/user/deletemany",
            method: "DELETE",
            error: error instanceof Error ? error.message : String(error),
          },
          "Error deleting multiple users"
        );
        res.status(400).json({ data: "ERROR DELETE: " + error });
      }
      break;

    default:
      res.status(405).end(`${req.method} Not Allowed`);
      break;
  }
}
