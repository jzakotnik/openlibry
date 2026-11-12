import { exportHandler } from "@/lib/spreadsheet/handlers";
import type { NextApiRequest, NextApiResponse } from "next";

/** GET /api/export?format=xlsx|ods — see lib/spreadsheet. */
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET")
    return res.status(405).end(`${req.method} Not Allowed`);
  return exportHandler(req, res);
}
