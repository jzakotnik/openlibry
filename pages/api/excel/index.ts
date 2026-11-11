import { exportHandler, importHandler } from "@/lib/spreadsheet/handlers";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // bump as needed
    },
  },
};

/**
 * @deprecated Legacy alias kept for existing bookmarks, backups scripts and
 * tests. Use GET /api/export?format=... and POST /api/import instead.
 */
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET":
      return exportHandler(req, res);
    case "POST":
      return importHandler(req, res);
    default:
      return res.status(405).end(`${req.method} Not Allowed`);
  }
}
