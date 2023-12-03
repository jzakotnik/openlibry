import { getLastAudit } from "@/entities/audit";

import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      try {
        const auditItem = (await getLastAudit(prisma)) as any;
        if (!auditItem)
          return res.status(400).json({ data: "ERROR: Audit log not found" });
        res.status(200).json(auditItem);
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
