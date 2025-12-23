import { getLastAudit } from "@/entities/audit";
import { prisma } from "@/entities/db";
import { LogEvents } from "@/lib/logEvents";
import { errorLogger } from "@/lib/logger";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      try {
        const auditItem = (await getLastAudit(prisma)) as any;
        if (!auditItem) {
          return res.status(400).json({ data: "ERROR: Audit log not found" });
        }
        res.status(200).json(auditItem);
      } catch (error) {
        errorLogger.error(
          {
            event: LogEvents.API_ERROR,
            endpoint: "/api/audit",
            method: "GET",
            error: error instanceof Error ? error.message : String(error),
          },
          "Error getting last audit entry"
        );
        res.status(400).json({ data: "ERROR: " + error });
      }
      break;

    default:
      res.status(405).end(`${req.method} Not Allowed`);
      break;
  }
}
